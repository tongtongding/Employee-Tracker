const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
const cTable = require("console.table");

const main = async () => {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "mushroom",
            database: "employee_db"
        });

        console.log(`Connected to db with id: ${connection.threadId}`);

        start(connection);

    } catch (err) {
        console.log(err);
    }
};

main();

const startPrompt = async () => {
    return inquirer
        .prompt({
            name: "toDo",
            type: "list",
            message: "What would you like to do?",
            choices: ["View All Departments", "View All Roles", "View All Employees", "View All Employees By Department", "View All Employees By Manager", "View Department Budget","Add Department", "Add Employee Role", "Add Employee", "Remove Department", "Remove Role", "Remove Employee", "Update Department", "Update Employee Role", "Update Employee Manager", "Quit"]
        })
};

const start = async (connection) => {
    const answer = await startPrompt();
    switch (answer.toDo) {
        case "View All Departments":
            await readAllDepartment(connection);
            await start(connection);
            break;
        case "View All Roles":
            await readAllRole(connection);
            await start(connection);
            break;
        case "View All Employees":
            await readAllEmplyees(connection);
            await start(connection);
            break;
        case "View All Employees By Department":
            const readEmployeesByDepAns = await readEmployeesByDepPrompt(connection);
            await readEmployeesByDep(connection,readEmployeesByDepAns);
            await start(connection);
            break;
        case "View All Employees By Manager":
            const readEmployeesByManagerAns = await readEmployeesByManagerPrompt(connection);
            await readEmployeesByManager(connection,readEmployeesByManagerAns);
            await start(connection);
            break;
        case "View Department Budget":
            await readDepartmentBudget(connection);
            await start(connection);
            break;
        case "Add Department":
            const addDeparmentAns = await addDepartmentPrompt(connection);
            await addDepartment(connection, addDeparmentAns);
            await start(connection);
            break;
        case "Add Employee Role":
            const addRoleAns = await addRolePrompt(connection);
            await addRole(connection, addRoleAns);
            await start(connection);
            break;
        case "Add Employee":
            const addEmployeeAns = await addEmployeePrompt(connection);
            await addEmployee(connection, addEmployeeAns);
            await start(connection);
            break;
        case "Remove Department":
            const deleteDepartmentAns = await deleteDepartmentPrompt(connection);
            await deleteDepartment(connection, deleteDepartmentAns);
            await start(connection);
            break;
        case "Remove Role":
            const deleteRoleAns = await deleteRolePrompt(connection);
            await deleteRole(connection,deleteRoleAns);
            await start(connection);
            break;
        case "Remove Employee":
            const deleteEmployeeAns = await deleteEmployeePrompt(connection);
            await deleteEmployee(connection, deleteEmployeeAns);
            await start(connection);
            break;
        case "Update Department":
            const updateDepartmentAns = await updateDepartmentPrompt(connection);
            await updateDepartment(connection,updateDepartmentAns);
            await start(connection);
            break;
        case "Update Employee Role":
            const updateRoleAns = await updateRolePrompt(connection);
            await updateRole(connection,updateRoleAns);
            await start(connection);
            break;
        case "Update Employee Manager":
            const updateManagerAns = await updateManagerPrompt(connection);
            await updateManager(connection,updateManagerAns);
            await start(connection);
            break;
       
        default:
            process.exit();
    };
};

//view department name
const readAllDepartment = async (connection) => {
    const [rows, fields] = await connection.query("SELECT name AS department FROM department");
    console.table(rows);
    return rows;
};

//query with all info from department table
const readAllFromDepartment = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM department");
    console.table(rows);
    return rows;
};

const getDepartment = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM department");
    return rows;
};

//prompt questions - department info
const addDepartmentPrompt = async (connection) => {
    return inquirer
        .prompt([
            {
                name: "departmentName",
                type: "input",
                message: "What is the department name?"
            }
        ])
};

//Add new department to database
const addDepartment = async (connection, addDeparmentAns) => {
    const sqlQuery = "INSERT INTO department(name) VALUES (?)";
    const params = [addDeparmentAns.departmentName];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};

//Update department - prompt questions
const updateDepartmentPrompt = async (connection) => {
    let allDepartments = await readAllFromDepartment(connection);
    allDepartments = allDepartments.map((department) => {
        return `${department.id}, ${department.name}`
    });
    return inquirer
    .prompt([
        {
            name: "department",
            type: "list",
            message: "Which department would you like to update?",
            choices: allDepartments
        },
        {
            name: "newDepartment",
            type: "input",
            message: "What is the new department name?"
        }
    ]);
};

//update department
const updateDepartment = async (connection, updateDepartmentAns) => {
    const sqlQuery = ("UPDATE department SET name=? WHERE id=?");
    const params = [updateDepartmentAns.newDepartment,updateDepartmentAns.department.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery,params);
    console.table(rows);
};

//delete department - prompt questions
const deleteDepartmentPrompt = async (connection) => {
    let allDepartments = await readAllFromDepartment(connection);
    allDepartments = allDepartments.map((department) => {
        return `${department.id}, ${department.name}`;
    });
    return inquirer
        .prompt([
            {
                name: "department",
                type: "list",
                message: "Which department would you like to remove?",
                choices: allDepartments
            }
        ]);
};

//delete department
const deleteDepartment = async (connection, deleteDepartmentAns) => {
    const sqlQuery = "DELETE FROM department WHERE id=?";
    const params = [deleteDepartmentAns.department.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};








//view roles title, salary, department name
const readAllRole = async (connection) => {
    const [rows, fields] = await connection.query("SELECT role.id,role.title, role.salary, department.name AS department FROM role INNER JOIN department ON department.id = role.department_id ");
    console.table(rows);
    return rows;
};

//create new role - prompt questions
const addRolePrompt = async (connection) => {
    let allDepartments = await getDepartment(connection);
    allDepartments = allDepartments.map((department) => {
        return `${department.id}, ${department.name}`;
    });
    return inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "What is the job title?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary?"
            },
            {
                name: "departmentID",
                type: "list",
                message: "Which department does the job belong to?",
                choices: allDepartments
            }
        ])
};

//create new role to database
const addRole = async (connection, addRoleAns) => {
    const sqlQuery = ("INSERT INTO role(title,salary,department_id) VALUE(?,?,?)");
    const params = [addRoleAns.title, addRoleAns.salary, addRoleAns.departmentID.split(",")[0]];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};

//delete role - prompt question
const deleteRolePrompt = async (connection) => {
    let allRoles = await readAllFromRole(connection);
    allRoles = allRoles.map((role) => {
        return `${role.id}, ${role.title}`;
    });
    return inquirer
        .prompt([
            {
                name: "role",
                type: "list",
                message: "Which role would you like to remove?",
                choices: allRoles
            }
        ])
};

//delete role
const deleteRole = async (connection,deleteRoleAns) => {
    const sqlQuery = ("DELETE FROM department WHERE id=?");
    const params=[deleteRoleAns.role.split(",")[0]];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};








//view all employees
const readAllEmplyees = async (connection) => {
    const sqlQuery = ("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name,' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON role.id = employee.role_id LEFT JOIN department ON department.id=role.department_id LEFT JOIN employee AS manager ON employee.manager_id = manager.id")
    const [rows, fields] = await connection.query(sqlQuery);
    console.table(rows);
};

//query with manager name
const viewManager = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM employee WHERE manager_id IS NULL");
    return rows;
};

//add new employee - prompt questions - employee info
const addEmployeePrompt = async (connection) => {

    let allManager = await viewManager(connection);
    allManager = allManager.map((employee) => {
        return `${employee.id},${employee.first_name},${employee.last_name}`;
    });

    allManager.unshift("None");

    const allRoles = await readAllRole(connection);
    let viewAllRoles = allRoles.map((role) => {
        return `${role.id}, ${role.title}`;
    });

    return inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name: "roleId",
                type: "list",
                message: "What is the employee's role?",
                choices: viewAllRoles
            },
            {
                name: "managerId",
                type: "list",
                message: "Who is the employee's manager",
                choices: allManager
            }
        ])
};

//add employees to database
const addEmployee = async (connection, addEmployeeAns) => {
    const sqlQuery = "INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)";

    if (addEmployeeAns.manager = "None") {
        managerId = null;
    } else { managerId = addEmployeeAns.manager.split(",")[0]}
    const params = [addEmployeeAns.firstName, addEmployeeAns.lastName, addEmployeeAns.roleId.split(",")[0], managerId];
    const [rows, fields] = await connection.query(sqlQuery, params);

    console.table(rows);
};

//view all from employee
const readAllFromEmployee = async (connection) => {
    const [rows, fields] = await connection.query ("SELECT * FROM employee");
    console.table(rows);
    return rows;
};

const getEmployee = async (connection) => {
    const [rows, fields] = await connection.query ("SELECT * FROM employee");
    return rows;
};

//update employee role - prompt role
const updateRolePrompt = async (connection) => {
    let allEmployees = await getEmployee(connection);
    allEmployees = allEmployees.map((employee) => {
        return `${employee.id}, ${employee.first_name},${employee.last_name}`;
    });

    const allRoles = await readAllRole(connection);
    let viewAllRoles = allRoles.map((role) => {
        return `${role.id}, ${role.title}`;
    });

    return inquirer
    .prompt([
        {
            name: "role",
            type: "list",
            message: "Which employee'role would you like to update?",
            choices: allEmployees
        },
        {
            name: "newRole",
            type: "list",
            message: "What is the employee's new role?",
            choices: viewAllRoles
        }
    ])
};

//update employee role
const updateRole = async (connection,updateRoleAns) => {
    const sqlQuery = ("UPDATE employee SET role_id = ? WHERE id = ?");
    const params = [updateRoleAns.newRole.split(",")[0],updateRoleAns.role.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery,params);
    console.table(rows);
};


//update employee manager - prompt questions
const updateManagerPrompt = async (connection) => {
    let allEmployees = await readAllFromEmployee(connection);
    allEmployees = allEmployees.map((employee) => {
        return `${employee.id}, ${employee.first_name},${employee.last_name}`;
    });

    let allManager = await viewManager(connection);
    allManager = allManager.map((employee) => {
        return `${employee.id},${employee.first_name},${employee.last_name}`;
    });

    return inquirer
    .prompt([
        {
            name: "employee",
            type: "list",
            message: "Which employee would you like to update his/her manager?",
            choices: allEmployees
        },
        {
            name: "manager",
            type: "list",
            message: "Who is the employee's new manager?",
            choices: allManager
        }
    ])
};

//update employee manager
const updateManager = async (connection,updateManagerAns) => {
    const sqlQuery = ("UPDATE employee SET manager_id = ? WHERE id = ?");
    const params = [updateManagerAns.manager.split(",")[0],updateManagerAns.employee.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery,params);
    console.table(rows);
};


//delete employee - prompt questions
const deleteEmployeePrompt = async (connection) => {
    let allEmployees = await readAllFromEmployee(connection);
    allEmployees = allEmployees.map((employee) => {
        return `${employee.id}, ${employee.first_name},${employee.last_name}`;
    });
    return inquirer
    .prompt([
        {
            name: "deleteEmployeeName",
            type: "list",
            message: "Which employee would you like to remove?",
            choices: allEmployees
        }
    ])
};

//delete employee 
const deleteEmployee = async (connection, deleteEmployeeAns) => {
    const sqlQuery = ("DELETE FROM employee WHERE id=?");
    const params=[deleteEmployeeAns.deleteEmployeeName.split(",")[0]];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};

const readEmployeesByDepPrompt = async (connection) => {
    let allDepartment = await readAllFromDepartment(connection);
    allDepartment = allDepartment.map((department)=>{
        return `${department.id}, ${department.name}`
    })
    return inquirer
    .prompt([
        {
            name: "departmentName",
            type: "list",
            message: "Which department would you like to view?",
            choices: allDepartment
        }
    ]);
};

// view all employees by department
const readEmployeesByDep= async (connection,readEmployeesByDepAns) => {
    const sqlQuery = ("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.id = ?");
    const params = [readEmployeesByDepAns.departmentName.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
    return rows;
};

//view all employees by manager 
const readEmployeesByManagerPrompt = async (connection) => {
    let allManager = await viewManager(connection);
    allManager = allManager.map((employee) => {
        return `${employee.id},${employee.first_name},${employee.last_name}`;
    });

    return inquirer
    .prompt([
        {
            name: "managerName",
            type: "list",
            message: "Which manager would you like to view?",
            choices: allManager
        }
    ]);
};

const readEmployeesByManager = async (connection,readEmployeesByManagerAns) => {
    const sqlQuery = ("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE employee.manager_id = ?");
    const params = [readEmployeesByManagerAns.managerName.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery,params);
    console.table(rows);
    return rows;
};


const readDepartmentBudget = async (connection) => {
    const [rows, fields] = await connection.query("SELECT department.id, department.name AS department, SUM(role.salary) AS budget FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id GROUP BY department.id");
    console.table(rows);
    return rows;
};