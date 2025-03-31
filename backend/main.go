package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/kavikkannan/go-ecommerce-grocery-delivery-service/pkg/config"
	"github.com/kavikkannan/go-ecommerce-grocery-delivery-service/pkg/routes"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	config.Connect()
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowCredentials: true,
		AllowHeaders:     "Content-Type, Authorization",
	}))

	routes.Setup(app)

	app.Listen(":9999")
}
