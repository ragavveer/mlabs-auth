const data = {
  employees: require("../model/employees.json"),
  setEmployees: function (data) {
    this.employees = data;
  },
};

const getAllEmployees = async (req, res) => {
  console.log("inside employess");
  const employees = data.employees;
  let { page, limit } = req.query;
  if (!page) page = 0;
  if (!limit) limit = 20;
  page = parseInt(page);
  limit = parseInt(limit);
  await new Promise((resolve) => setTimeout(() => resolve(), 2000));
  return res.json({
    users: employees.slice(page * limit, page * limit + limit),
    total: employees.length,
  });
};

// const createNewEmployee = (req, res) => {
//     const newEmployee = {
//         id: data.employees?.length ? data.employees[data.employees.length - 1].id + 1 : 1,
//         firstname: req.body.firstname,
//         lastname: req.body.lastname
//     }

//     if (!newEmployee.firstname || !newEmployee.lastname) {
//         return res.status(400).json({ 'message': 'First and last names are required.' });
//     }

//     data.setEmployees([...data.employees, newEmployee]);
//     res.status(201).json(data.employees);
// }

const updateEmployee = async (req, res) => {
  await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
  const employee = data.employees.find((emp) => emp.id === req.body.userId);
  if (!employee) {
    return res
      .status(400)
      .json({ message: `User ${req.body.emailId} not found` });
  }
  if (employee.status === "ACTIVE") {
    employee.status = "INACTIVE";
  } else {
    employee.status = "ACTIVE";
  }
  // if (req.body.firstname) employee.firstname = req.body.firstname;
  // if (req.body.lastname) employee.lastname = req.body.lastname;
  // const filteredArray = data.employees.filter(emp => emp.emailId !== req.body.emailId);
  // const unsortedArray = [...filteredArray, employee];
  // data.setEmployees(unsortedArray.sort((a, b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
  data.setEmployees(data.employees);
  res.json(employee);
};

// const deleteEmployee = (req, res) => {
//     const employee = data.employees.find(emp => emp.id === parseInt(req.body.id));
//     if (!employee) {
//         return res.status(400).json({ "message": `Employee ID ${req.body.id} not found` });
//     }
//     const filteredArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
//     data.setEmployees([...filteredArray]);
//     res.json(data.employees);
// }

const getEmployee = (req, res) => {
  const employee = data.employees.find(
    (emp) => emp.id === parseInt(req.body.userId)
  );
  if (!employee) {
    return res
      .status(400)
      .json({ message: `Employee ID ${req.params.id} not found` });
  }
  res.json(employee);
};

module.exports = {
  getAllEmployees,
  //   createNewEmployee,
  updateEmployee,
  //   deleteEmployee,
  getEmployee,
};
