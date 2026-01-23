"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elysia_1 = require("elysia");
var node_1 = require("@elysiajs/node");
var cors_1 = require("@elysiajs/cors");
var static_1 = require("@elysiajs/static");
var auth_1 = require("@/application/middleware/auth");
var logger_1 = require("@/application/middleware/logger");
var product_1 = require("@/application/controller/product");
var recipe_1 = require("@/application/controller/recipe");
var shopping_item_1 = require("@/application/controller/shopping-item");
var receipt_1 = require("@/application/controller/receipt");
var statistics_1 = require("@/application/controller/statistics");
var fridge_scan_1 = require("@/application/controller/fridge-scan");
var openfoodfacts_1 = require("@/application/controller/openfoodfacts");
var auth_2 = require("@/application/controller/auth");
var api = new elysia_1.Elysia({ prefix: "/api" })
    .use(product_1.productController)
    .use(shopping_item_1.shoppingItemController)
    .use(recipe_1.recipeController)
    .use(receipt_1.receiptController)
    .use(statistics_1.statisticsController)
    .use(fridge_scan_1.fridgeScanController)
    .use(openfoodfacts_1.openfoodfactsController);
var app = new elysia_1.Elysia({ adapter: (0, node_1.node)() })
    .use((0, cors_1.cors)({
    origin: true, // Autorise toutes les origines en développement
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}))
    .use(auth_2.authController)
    .use(logger_1.loggerMiddleware)
    .use(auth_1.authMiddleware)
    .use((0, static_1.staticPlugin)({
    assets: "public",
    prefix: "/",
}))
    .get("/health", function () { return ({ status: "ok" }); })
    .use(api)
    .listen(3000, function (_a) {
    var hostname = _a.hostname, port = _a.port;
    console.log("\uD83E\uDD8A Elysia is running at ".concat(hostname, ":").concat(port, " (").concat(process.env.NODE_ENV, ")"));
});
