const mysql = require("mysql2/promise");
const inquirer = require("inquirer");

const main = async () => {
 try{
    const connection = await mysql.createConnection({

        host: "localhost",
        port: 3306,
        user: "root",
        password: "mushroom",
        database: "employee_db"
    });

    console.log(`Connected to db with id: ${connection.threadId}`);

    await start(connection);
    
    connection.end();
 } catch (err){
     console.log(err);
 }
};

const start = async (connection) => {
    inquirer
    .prompt({
        name: "toDo",
        type: "list",
        message: "What would you like to do?",
        choices: ["Quit", "View All Employees", "View All Employees By Department", "View All Employees By Manager", "Add employee","Remove Emplyee", "Update Employee", "Delete Emplyee"]
    })
    .then((answer)=>{
        if (answer.toDo === "View All Employee") {
            readAllEmplyees(connection);
          }
        //   else if(answer.toDo === "View All Employees By Department") {
        //     bidAuction();
        //   } 
        else{
            connection.end();
          }
    })
};

const readAllEmplyees = async(connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM employee");

    console.log(rows);
};

const addEmployee = async(connection) => {
    inquirer
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
            name: "role",
            type: "list",
            message: ["Sales Lead", "Salesperson", "Lead Engineer", "Software Engineer", "Account Manager", "Accountant", "Legal Team Lead"]
        },
        {
            name: "manager",
            type: "list",
            message: []
        }
    ])
    .then((answer)=>{
        const createProduct = async (connection) => {
            const sqlQuery = "INSERT INTO employee SET ?";
            const params = {
                first_name: answer.firstName,
                last_name: answer.lastName,
            };
        
            const[rows, fields] = await connection.query(sqlQuery,params);
        
            console.log(rows);
        };
    }

    )
}

main();