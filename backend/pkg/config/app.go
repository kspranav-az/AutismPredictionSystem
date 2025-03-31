package config

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

var DB *sql.DB

func Connect() {
	var err error

	dsn := "root:2004@tcp(127.0.0.1:3306)/aimed?parseTime=true"

	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	fmt.Println("Connected to MySQL successfully!")

	err = createTables(DB)
	if err != nil {
		log.Fatalf("Failed to create tables: %v", err)
	}
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(25)
	DB.SetConnMaxLifetime(5 * time.Minute)
}
func createTables(db *sql.DB) error {
	tableStatements := []string{

		`CREATE TABLE IF NOT EXISTS Login (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			number VARCHAR(255) NOT NULL UNIQUE,
			password BLOB NOT NULL,
			is_admin BOOLEAN NOT NULL DEFAULT FALSE,
			no_of_files INT NOT NULL,
			role VARCHAR(100) NOT NULL,
    		appointed_members TEXT DEFAULT NULL,
			reportTo INT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS Student (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(400) NOT NULL,
			age VARCHAR(50) NOT NULL,
			gender VARCHAR(50) NOT NULL,
			grade VARCHAR(255) NOT NULL,
			jaundice VARCHAR(50) NOT NULL,
			prediction VARCHAR(100) NOT NULL,
			asd_confidence VARCHAR(50) NOT NULL,
			video_confidence VARCHAR(50) NOT NULL,
			final_confidence VARCHAR(50) NOT NULL

		);`,
	}

	for _, stmt := range tableStatements {
		_, err := db.Exec(stmt)
		if err != nil {
			return fmt.Errorf("failed to create table: %v", err)
		}
	}

	return nil
}

func GetDB() *sql.DB {
	return DB
}
