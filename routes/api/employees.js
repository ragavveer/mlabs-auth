const express = require("express");
const router = express.Router();
const employeesController = require("../../controllers/employeesController");

router.route("/").get(employeesController.getAllEmployees);

router.route("/").post(employeesController.getEmployee);

router.route("/activate").put(employeesController.updateEmployee);

router.route("/deactivate").put(employeesController.updateEmployee);

// .post(employeesController.createNewEmployee)
// .put(employeesController.updateEmployee)
// .delete(employeesController.deleteEmployee);

// router.route("/:id").get(employeesController.getEmployee);

module.exports = router;
