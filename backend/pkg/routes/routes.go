package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kavikkannan/go-ecommerce-grocery-delivery-service/pkg/controllers"
)

func Setup(app *fiber.App) {

	app.Post("/api/register", controllers.Register)
	app.Post("/api/login", controllers.Login)
	app.Get("/api/user", controllers.User)
	app.Get("/api/user/:userId", controllers.GetUserByID)
	app.Post("/api/logout", controllers.Logout)

	//aimed
	app.Post("/setReport", controllers.SetReport)
	app.Get("/getReport/:id", controllers.GetStudentReport)
	app.Get("/getAllReport", controllers.GetAllStudentReports)

}
