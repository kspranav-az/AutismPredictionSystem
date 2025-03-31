package controllers

import (
	"database/sql"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/kavikkannan/go-ecommerce-grocery-delivery-service/pkg/config"
	"golang.org/x/crypto/bcrypt"
	"log"
	"strconv"
	"time"
)

const SecretKey = "secret"

func Register(c *fiber.Ctx) error {
	var data map[string]interface{}

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	passwordStr, ok := data["password"].(string)
	if !ok || passwordStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Password is required"})
	}
	password, _ := bcrypt.GenerateFromPassword([]byte(passwordStr), 14)

	isAdmin := false
	if val, ok := data["is_admin"].(bool); ok {
		isAdmin = val
	} else if val, ok := data["is_admin"].(string); ok && val == "true" {
		isAdmin = true
	}

	noOfFiles := 0
	switch v := data["no_of_files"].(type) {
	case string:
		noOfFiles, _ = strconv.Atoi(v)
	case float64:
		noOfFiles = int(v)
	}

	role, ok := data["role"].(string)
	if !ok || role == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Role is required"})
	}

	appointedMembersStr := ""

	reportto := 1

	_, err := config.DB.Exec(
		"INSERT INTO Login (name, email, password, number, is_admin, no_of_files, role, appointed_members, reportTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		data["name"], data["email"], password, data["number"], isAdmin, noOfFiles, role, appointedMembersStr, reportto)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to register user", "error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid input data"})
	}

	var id int
	var hashedPassword []byte
	var isAdmin bool
	var number string

	err := config.DB.QueryRow("SELECT id, password, number, is_admin FROM Login WHERE email = ?", data["email"]).Scan(&id, &hashedPassword, &number, &isAdmin)
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "User not found"})
	} else if err != nil {
		fmt.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error"})
	}

	if err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(data["password"])); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Incorrect password"})
	}

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"Issuer":  strconv.Itoa(id),
		"Expires": time.Now().Add(time.Hour * 24).Unix(),
		"IsAdmin": isAdmin,
	})
	token, err := claims.SignedString([]byte(SecretKey))
	if err != nil {
		fmt.Println("JWT signing error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Could not login"})
	}

	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24),
		HTTPOnly: true,
		SameSite: "Lax",
	}
	if c.Protocol() == "https" {
		cookie.Secure = true
	}
	c.Cookie(&cookie)

	return c.JSON(fiber.Map{"message": "Login successful"})
}

func User(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")

	token, err := jwt.ParseWithClaims(cookie, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthenticated"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["Issuer"] == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid claims in token"})
	}

	userId, err := strconv.Atoi(claims["Issuer"].(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid user ID in token"})
	}

	var user struct {
		ID        int
		Name      string
		Email     string
		Number    string
		IsAdmin   bool
		PPass     string
		NoOfFiles int
		Role      string
	}

	err = config.DB.QueryRow("SELECT id, name, email, number, is_admin, password ,no_of_files ,role FROM Login WHERE id = ?", userId).Scan(&user.ID, &user.Name, &user.Email, &user.Number, &user.IsAdmin, &user.PPass, &user.NoOfFiles, &user.Role)
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "User not found"})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error"})
	}

	return c.JSON(user)
}

func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("userId")
	var user struct {
		ID        int
		Name      string
		Email     string
		Number    string
		IsAdmin   bool
		PPass     string
		NoOfFiles int
		Role      string
	}

	err := config.DB.QueryRow("SELECT id, name, email, number, is_admin, password ,no_of_files ,role FROM Login WHERE id = ?", userID).
		Scan(&user.ID, &user.Name, &user.Email, &user.Number, &user.IsAdmin, &user.PPass, &user.NoOfFiles, &user.Role)
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "User not found"})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error"})
	}

	return c.JSON(user)
}

func Logout(c *fiber.Ctx) error {
	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		SameSite: "None",
	}
	c.Cookie(&cookie)
	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func SetReport(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		log.Println("Error parsing request body:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request format"})
	}

	query := `
		INSERT INTO Student (name, age, gender, grade, jaundice, prediction, asd_confidence, video_confidence, final_confidence) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := config.DB.Exec(query,
		data["name"],
		data["age"],
		data["gender"],
		data["grade"],
		data["jaundice"],
		data["prediction"],
		data["asd_confidence"],
		data["video_confidence"],
		data["final_confidence"],
	)

	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to register Encrypted Data"})
	}

	return c.JSON(fiber.Map{"message": "Data inserted successfully"})
}

func GetStudentReport(c *fiber.Ctx) error {
	index := c.Params("id")
	var Report struct {
		Id               int
		Name             string
		Age              string
		Gender           string
		Grade            string
		Jaundice         string
		Prediction       string
		Asd_confidence   string
		Video_confidence string
		Final_confidence string
	}
	err := config.DB.QueryRow("SELECT  id, name, age, gender, grade, prediction, asd_confidence, video_confidence, final_confidence FROM Student WHERE id = ?", index).Scan(&Report.Id, &Report.Name, &Report.Age, &Report.Gender, &Report.Grade, &Report.Prediction, &Report.Asd_confidence, &Report.Video_confidence, &Report.Final_confidence)
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Eindex not found"})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error"})
	}

	return c.JSON(Report)
}

func GetCaseById(c *fiber.Ctx) error {
	index := c.Params("userID")
	rows, err := config.DB.Query("SELECT pindex, Pfile, PIV, Name, status, agentId, coustomerDetails, unknown1 FROM CaseName WHERE agentId = ?", index)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error"})
	}
	defer rows.Close()

	var Cases []struct {
		PIndex           string
		PFile            string
		PIV              string
		Name             string
		Status           string
		AgentId          string
		CoustomerDetails string
		Unknown1         string
	}

	for rows.Next() {
		var Case struct {
			PIndex           string
			PFile            string
			PIV              string
			Name             string
			Status           string
			AgentId          string
			CoustomerDetails string
			Unknown1         string
		}
		if err := rows.Scan(&Case.PIndex, &Case.PFile, &Case.PIV, &Case.Name, &Case.Status, &Case.AgentId, &Case.CoustomerDetails, &Case.Unknown1); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to scan notifications"})
		}
		Cases = append(Cases, Case)
	}

	return c.JSON(Cases)
}

func GetAllStudentReports(c *fiber.Ctx) error {
	// Define struct type
	type StudentReport struct {
		Id              int
		Name            string
		Age             string
		Gender          string
		Grade           string
		Jaundice        string
		Prediction      string
		AsdConfidence   string
		VideoConfidence string
		FinalConfidence string
	}

	var reports []StudentReport

	rows, err := config.DB.Query("SELECT id, name, age, gender, grade, jaundice, prediction, asd_confidence, video_confidence, final_confidence FROM Student")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error"})
	}
	defer rows.Close()

	for rows.Next() {
		var report StudentReport

		if err := rows.Scan(
			&report.Id, &report.Name, &report.Age, &report.Gender, &report.Grade, &report.Jaundice,
			&report.Prediction, &report.AsdConfidence, &report.VideoConfidence, &report.FinalConfidence,
		); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error scanning data"})
		}

		reports = append(reports, report)
	}

	if len(reports) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "No student reports found"})
	}

	return c.JSON(reports)
}
