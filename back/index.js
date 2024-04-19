const express=require('express')
// const cors=require('cors')
const path = require('path');
const app=express()
const jwt = require('jsonwebtoken');


app.use(express.json())
// app.use(cors())
// app.use(express.urlencoded({extended:true}))

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = '../vite-project/public/upload-files/';
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

const connection=require('./connection');
const { log } = require('console');

const port=3000
app.listen(port,()=> {
    console.log(`server is running in port:`,port)
})

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {    
      jwt.verify(authHeader, 'hello', (err, username) => {
        if (err) {
          return res.sendStatus(403);
           }  
        else{
            req.headers.id=username.id
            req.headers.role=username.role
          next();
          }
      });
    } else {
      res.sendStatus(401);
    }
  };


  app.post('/api/emp/emplogin', async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password)
            return res.status(401).json({ msg: 'Invalid username or password' });

        const results = await connection.query('SELECT * FROM employee WHERE empname=? AND emppassword=?', [name, password]);

       
        if (results[0].length === 0)
            return res.status(401).json({ msg: 'Invalid username or password' });
        else {
            const empid = results[0][0].empid;
            const emprole=results[0][0].emprole
            const token = jwt.sign({ name, id: empid,role:emprole }, 'hello');
            return res.status(200).json({ msg: 'Login successful', token, role: results[0][0].emprole });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server Error" });
    }
});
// app.post('/api/emp/emplogin',(req,res)=>{
//     try{
        
//         const {name,password}=req.body
       
//         if(!name || !password)
//         return res.status(401).json({msg:'Invalid username or password'})
        
        
//         connection.query('Select * from employee where empname=? and emppassword=?',[name,password],(err,results)=>{
//             if(err)
//             {
//                 console.error(err)
//                 return res.status(500).json({ msg: 'Server Error' });
//             }
//             console.log(results);
//             if(results.length===0)
//             return res.status(401).json({ msg: 'Invalid username or password' });
//             else
//             {
//                 const empid = results[0].empid;
//                 const token = jwt.sign({ name, id: empid }, 'hello');
//                 // const token = jwt.sign({ name,id:results.empid }, 'hello');
//             return res.status(200).json({ msg: 'Login successful', token,role:results[0].emprole});
//             }
//         })
    
//     }
//     catch(err){
//         console.log(err);
//        return res.status(500).json({msg:"Server Error"});
//       }
// })


app.get('/api/emp/getOrganisations', authenticateJwt, async (req, res) => {
    try {
        const results = await connection.query('SELECT organcode, organisationname FROM organisation');

       
        if (results[0].length === 0) {
            return res.status(200).json({ msg: [] });
        } else {
            // console.log(results);
            res.status(200).json({ msg: results[0] });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server Error" });
    }
});

// app.get('/api/emp/getOrganisations', authenticateJwt,  (req, res) => {
//     try {
//        connection.query('SELECT organcode, organisationname FROM organisation', (err, result) => {
//           if (err) {
//              console.error(err);
//              return res.status(500).json({ msg: 'Server Error' });
//           }
//           if (result.length === 0) {
//              return res.status(200).json({ msg: [] });
//           } else {
//             //  console.log(result);
//              res.status(200).json({msg:result});
//           }
//        });
//     } catch (err) {
//        console.log(err);
//        return res.status(500).json({ msg: "Server Error" });
//     }
//  });


//  app.post('/upload', upload.array('files'), (req, res) => {
//     try {
//       // File upload successful
//     //   console.log(req.files);
//       const {caseuid} = req.body;
//         for(const file in req.files)
//         {
//             const filename='../vite-project/public/upload-files/'+file.originalname
//             connection.query('INSERT INTO file (filename,ticketid) VALUES (?,?)',[filename,caseuid],(err,result)=>{
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).json({ msg: 'Server Error' });
//                  }
//                  if(result.length===0)
//                  return res.status(401).json({msg:"Files Not! Added"});
//             })

//             return res.status(201).json({msg:"Files Added"});           
            
//         }
   
//     } catch (error) {
//       console.log(error);
//       // Handle error if file upload fails
//       res.status(401).json({ msg: 'An error occurred during file upload.' });
//     }
//   });

//  app.post('/api/emp/addTicket',authenticateJwt,async (req,res)=>{
//     try {
      
//         const {organisationName,caseId,applicantName,mobileNo,verificationType,address,triggered,employeesname}=req.body
        
//         if( !organisationName || !applicantName || !verificationType || !employeesname){
//             res.status(401).json({ msg: "Case Is Not Registered" });
//             return;
//         } 

       
        
//         connection.query('Select * from tickets where staffid=? order by oid desc',[employeesname],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
             
//              let oid =(result.length ===0)?0:parseInt(result[0].oid)+1
//              const caseuid=employeesname+'-'+oid 

//              connection.query('insert into tickets (organisationid,caseid,caseuid,oid,applicantname,staffid,mobileno,verificationtype,address,triggered) values(?,?,?,?,?,?,?,?,?,?)',[organisationName,caseId,caseuid,oid,applicantName,employeesname,mobileNo,verificationType,address,triggered],(err,result)=>{
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).json({ msg: 'Server Error' });
//                  }
//                  if(result.length!==0)
//                  {
//                     res.status(201).json({msg:"Case Registered",caseuid});
//                     return
//                  }
//                  else
//                  res.status(401).json({msg:"Case Not! Registered"});
//             })
           
//         })
      
//     } 
//     catch (error) {        
//         console.log(error);
//         res.status(501).send({msg:'Cannot Generate Bill'})        
//     }
// });



app.post('/api/emp/addTicket', upload.array('files'), authenticateJwt, async (req, res) => {
    try {
        const { organid, caseId, applicantName, mobileNo, verificationType, address, triggered, empid } = req.body;

        const { id } = req.headers;

        if (!organid || !applicantName || !verificationType || !empid || !id) {
            return res.status(401).json({ msg: "Case Is Not Registered" });
        }

        const ticketResult = await connection.query('SELECT * FROM tickets WHERE staffid=? ORDER BY oid DESC', [empid]);
        let oid = (ticketResult[0].length === 0) ? 0 : parseInt(ticketResult[0][0].oid) + 1;
        console.log(oid);
        const caseuid = empid + '-' + oid;

        const insertResult = await connection.query('INSERT INTO tickets (organisationid, caseid, caseuid, oid,issuedby, applicantname, ticketstatus, staffid, mobileno, verificationtype, address, triggered) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?,?)',
            [parseInt(organid), caseId, caseuid, oid,id, applicantName,"Pending", parseInt(empid), mobileNo, verificationType, address, triggered]);

        if (insertResult[0].affectedRows !== 1) {
            return res.status(401).json({ msg: "Case Not! Registered" });
        }

        for (const file of req.files) {
            const filename = '/upload-files/' + file.originalname;
            const fileInsertResult = await connection.query('INSERT INTO file (filename, ticketid) VALUES (?, ?)', [filename, caseuid]);

            if (fileInsertResult[0].affectedRows !== 1) {
                return res.status(401).json({ msg: "Files Not! Added" });
            }
        }

        return res.status(201).json({ msg: "Case Registered" });
    } catch (error) {
        console.error(error);
        return res.status(501).send({ msg: 'Cannot Generate Bill' });
    }
});

app.delete('/api/emp/deletecase/:code', authenticateJwt, async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(401).json({ msg: "Please Send a Valid Code!!" });
        }
        const result = await connection.query('DELETE FROM tickets WHERE caseuid=?', [code]);
        console.log(result);
        // const fileCheckResult = await connection.query('SELECT * FROM file WHERE ticketid=?', [code]);
        // if (fileCheckResult[0].length === 0) {
        //     return res.status(201).json({ msg: "Ticket Deleted" });
        // }

        const result1=await connection.query('DELETE FROM file WHERE ticketid=?', [code]);
        console.log(result1[0]);

        return res.status(201).json({ msg: "Ticket Deleted" });

        // if (result[0].affectedRows !== 0 && result1[0].affectedRows !== 0) {
          
        // } else {
        //     return res.status(401).json({ msg: "Ticket NOT! Deleted" });
        // }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});

// app.post('/api/emp/addTicket',upload.array('files'),authenticateJwt,async (req,res)=>{
//     try {
      
//         const {organid,caseId,applicantName,mobileNo,verificationType,address,triggered,empid}=req.body
        
//         if( !organid || !applicantName || !verificationType || !empid){
//             res.status(401).json({ msg: "Case Is Not Registered" });
//             return;
//         } 

       
        
//         connection.query('Select * from tickets where staffid=? order by oid desc',[empid],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
             
//              let oid =(result.length ===0)?0:parseInt(result[0].oid)+1
//              const caseuid=empid+'-'+oid 

//              connection.query('insert into tickets (organisationid,caseid,caseuid,oid,applicantname,staffid,mobileno,verificationtype,address,triggered) values(?,?,?,?,?,?,?,?,?,?)',[organid,caseId,caseuid,oid,applicantName,empid,mobileNo,verificationType,address,triggered],(err,result)=>{
//                 if (err) {
//                     console.error(err);
//                     return res.status(401).json({ msg: 'Server Error' });
//                  }
//                  if(result.length!==0)
//                  {

                  
//                             for(const file in req.files)
//         {
           
//             const filename='/upload-files/'+req.files[file].originalname
          
//             connection.query('INSERT INTO file (filename,ticketid) VALUES (?,?)',[filename,caseuid],(err,result)=>{
//                 if (err) {
//                     console.error(err);
//                     return res.status(401).json({ msg: 'Server Error' });
//                  }
//                  if(result.length===0)
//                  return res.status(401).json({msg:"Files Not! Added"});
//             })
                       
//         }
//        return res.status(201).json({msg:"Case Registered"});
//                  }
//                  else
//                  res.status(401).json({msg:"Case Not! Registered"});
//             })
           
//         })
      
//     } 
//     catch (error) {        
//         console.log(error);
//         res.status(501).send({msg:'Cannot Generate Bill'})        
//     }
// });






app.post('/api/emp/addOrganisation', authenticateJwt, async (req, res) => {
    try {
        const { organisationname } = req.body;

        if (!organisationname) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

        const existingOrgResult = await connection.query('SELECT * FROM organisation WHERE organisationname=?', [organisationname]);
        
        if (existingOrgResult[0].length !== 0) {
            return res.status(401).json({ msg: "Organisation Already exists!!" });
        }

        const insertResult = await connection.query('INSERT INTO organisation (organisationname) VALUES (?)', [organisationname]);  
        
        if (insertResult[0].affectedRows !== 1) {
            return res.status(401).json({ msg: "Organisation Name NOT! Saved" });
        }

        return res.status(201).json({ msg: "Organisation Name Saved" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server Error" });
    }
});

// app.post('/api/emp/addOrganisation',authenticateJwt, (req,res)=>{
//     try {

//         const {organisationname}=req.body

//         if(!organisationname ){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }

//          connection.query('Select * from organisation where organisationname=?',[organisationname],(err,result)=> {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              if(result.length!==0)
//              {
//                 res.status(401).json({msg:"Organisation Already exists!!"});
//                 return
//              }
//         })    


//           connection.query('insert into organisation (organisationname) values (?)',[organisationname],(err,result)=> {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              if(result.length!==0)
//              {
//                 res.status(201).json({msg:"Organisation Name Saved"});
//                 return
//              }
//              else
//              res.status(401).json({msg:"Organisation Name NOT! Saved"});
//         })    
        
     
        
//     } 
//     catch (error) {
//         console.log(err);
//        return res.status(500).json({msg:"Server Error"});  
//     }
// });

app.put('/api/emp/updateOrganisation/:organcode', authenticateJwt, async (req, res) => {
    try {
        const { organisationname } = req.body;

        if (!organisationname) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

        const result = await connection.query('UPDATE organisation SET organisationname=? WHERE organcode=?', [organisationname, req.params.organcode]);

        if (result[0].affectedRows !== 0) {
            return res.status(201).json({ msg: "Organisation Updated" });
        } else {
            return res.status(401).json({ msg: "Organisation NOT! Updated" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server Error" });
    }
});


// app.put('/api/emp/updateOrganisation/:organcode',authenticateJwt, (req,res)=>{
//     try {
//         const {organisationname}=req.body

//         if(!organisationname){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }

//          connection.query('update organisation set organisationname=? where organcode=?',[organisationname,req.params.organcode],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              if(result.length!==0)
//                 res.status(201).json({msg:"Organisation Updated"});
//             else
//             res.status(401).json({msg:"Organisation NOT! Updated"});
//         })
        
            
//     }   
//     catch (error) {

//         console.log(err);
//        return res.status(500).json({msg:"Server Error"});
//     }
// });


app.delete('/api/emp/deleteOrganisation/:code', authenticateJwt, async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(401).json({ msg: "Please Send a Valid Code!!" });
        }
        const result = await connection.query('DELETE FROM organisation WHERE organcode=?', [code]);
        if (result[0].affectedRows !== 0) {
            return res.status(201).json({ msg: "Organisation Deleted" });
        } else {
            return res.status(401).json({ msg: "Organisation NOT! Deleted" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});

app.get('/api/emp/getStaffEmployees', authenticateJwt, async (req, res) => {
    try {
        const result = await connection.query('SELECT empid, empname, emppassword, emprole FROM employee WHERE emprole=?', ['staff']);
        if (result[0].length === 0) {
            return res.status(200).json({ msg: [] });
        } else {
            // console.log(result);
            return res.status(200).json({ msg: result[0] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});


// app.delete('/api/emp/deleteOrganisation/:code',authenticateJwt, (req,res)=>{
//     try {
//         const {code}=req.params
//         if(!code){
//             res.status(401).json({msg:"Please Send a Valid Code!!"});
//             return
//         }
//        connection.query('delete from organisation where organcode=?',[code],(err,result)=>{
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ msg: 'Server Error' });
//          }
//          if(result.length!==0)
//          res.status(201).json({msg:"Organisation Deleted"});
//         else
//         res.status(401).json({msg:"Organisation NOT! Deleted"});  
//        })
       
//     } 
//     catch (error) {
//         console.log(error);
//         res.send({msg:'Not deleted'})        
//     }
// });

// app.get('/api/emp/getStaffEmployees', authenticateJwt,  (req, res) => {
//     try {
//        connection.query('SELECT empid,empname,emppassword,emprole FROM employee where emprole=?',['staff'], (err, result) => {
//           if (err) {
//              console.error(err);
//              return res.status(500).json({ msg: 'Server Error' });
//           }
//           if (result.length === 0) {
//              return res.status(401).json({ msg: [] });
//           } else {
//             //  console.log(result);
//              res.status(200).json({msg:result});
//           }
//        });
//     } catch (err) {
//        console.log(err);
//        return res.status(500).json({ msg: "Server Error" });
//     }
//  });


// app.get('/api/emp/getEmployees', authenticateJwt,  (req, res) => {
//     try {
//        connection.query('SELECT empid,empname,emppassword,emprole FROM employee', (err, result) => {
//           if (err) {
//              console.error(err);
//              return res.status(500).json({ msg: 'Server Error' });
//           }
//           if (result.length === 0) {
//              return res.status(401).json({ msg: [] });
//           } else {
//             //  console.log(result);
//              res.status(200).json({msg:result});
//           }
//        });
//     } catch (err) {
//        console.log(err);
//        return res.status(500).json({ msg: "Server Error" });
//     }
//  });


// app.post('/api/emp/addEmployees',authenticateJwt, (req,res)=>{
//     try {

//         const {uniqueId,empname,emppassword,emprole}=req.body

//         if(!empname || !emppassword || !emprole){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }

//         connection.query('Select * from employee where empid=?',[uniqueId],(err,result)=> {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              if(result.length!==0)
//              {
//                 res.status(401).json({msg:"Employee Already exists!!"});
//                 return
//              }
//         })    


//         connection.query('insert into employee (empid,empname,emppassword,emprole) values(?,?,?,?)',[uniqueId,empname,emppassword,emprole],(err,result)=> {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              if(result.length!==0)
//              {
//                 res.status(201).json({msg:"Employee Saved"});
//                 return
//              }
//              else
//              res.status(401).json({msg:"Employee NOT! Saved"});
//         })    
        
     
        
//     } 
//     catch (error) {
//         console.log(err);
//        return res.status(500).json({msg:"Server Error"});  
//     }
// });


app.get('/api/emp/getEmployees', authenticateJwt, async (req, res) => {
    try {
        const result = await connection.query('SELECT empid, empname, emppassword, emprole FROM employee');

        if (result[0].length === 0) {
            return res.status(200).json({ msg: [] });
        } else {
            // console.log(result);
            return res.status(200).json({ msg: result[0] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});


app.post('/api/emp/addEmployees', authenticateJwt, async (req, res) => {
    try {
        const { uniqueId, empname, emppassword, emprole } = req.body;

        if (!empname || !emppassword || !emprole) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

        const existingEmpResult = await connection.query('SELECT * FROM employee WHERE empname=? and emprole=?', [empname,emprole]);
        console.log(existingEmpResult[0]);
        if (existingEmpResult[0].length !== 0) {
            return res.status(401).json({ msg: "Employee Already exists!!" });
        }

        const insertResult = await connection.query('INSERT INTO employee (empid, empname, emppassword, emprole) VALUES (?, ?, ?, ?)', [uniqueId, empname, emppassword, emprole]);
        if (insertResult[0].affectedRows !== 1) {
            return res.status(401).json({ msg: "Employee NOT! Saved" });
        }

        return res.status(201).json({ msg: "Employee Saved" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});



app.put('/api/emp/UpdateTicketStatus/:caseuid', authenticateJwt, async (req, res) => {
    try {
       const {caseuid}=req.params
        if(!caseuid)
        return res.status(401).json({ msg: "Error Updating Case" });

        console.log('caseuid',caseuid);

        const result = await connection.query('UPDATE tickets SET ticketstatus=? WHERE caseuid=?', ["Done",caseuid]);

        if (result[0].affectedRows !== 0) {
            return res.status(201).json({ msg: "Case Updated" });
        } else {
            return res.status(401).json({ msg: "Case NOT! Updated" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});


app.put('/api/emp/updateEmployees/:empid', authenticateJwt, async (req, res) => {
    try {
        const { empname, emppassword, emprole } = req.body;

        if (!empname || !emppassword || !emprole) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

        const result = await connection.query('UPDATE employee SET empname=?, emppassword=?, emprole=? WHERE empid=?', [empname, emppassword, emprole, req.params.empid]);

        if (result[0].affectedRows !== 0) {
            return res.status(201).json({ msg: "Employee Details Updated" });
        } else {
            return res.status(401).json({ msg: "Employee Details NOT! Updated" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});

app.delete('/api/emp/deleteEmployees/:code', authenticateJwt, async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(401).json({ msg: "Please Send a Valid Code!!" });
        }
        const result = await connection.query('DELETE FROM employee WHERE empid=?', [code]);
        if (result[0].affectedRows !== 0) {
            return res.status(201).json({ msg: "Employee Deleted" });
        } else {
            return res.status(401).json({ msg: "Employee NOT! Deleted" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});

app.get('/api/emp/Dashboardcases', authenticateJwt, async (req, res) => {
    try {
      
        const {role,id}=req.headers
        let result;
        if(!role || !id)
        return res.status(401).json({ msg: "Plz Login Again" });

        if(role==='superadmin')
        {
        result=await connection.query(`SELECT t.*, o.organisationname AS organisation, e.empname AS employees,f.empname AS issued FROM tickets t 
        LEFT JOIN organisation o ON t.organisationid=o.organcode
        LEFT JOIN employee e ON t.staffid=e.empid
        LEFT JOIN employee f ON t.issuedby=f.empid
        where t.ticketstatus=?
        ORDER BY t.createdAt ASC`,["Pending"]);
        }
        else{
        result = await connection.query(`SELECT t.*, o.organisationname AS organisation, e.empname AS employees FROM tickets t 
        LEFT JOIN organisation o ON t.organisationid=o.organcode
        LEFT JOIN employee e ON t.staffid=e.empid
        where t.ticketstatus=? and t.issuedby=?
        ORDER BY t.createdAt ASC`,["Pending",id]);
        }

        console.log(result[0]);
        if (result[0].length === 0) {
            return res.status(201).json({ msg: [],role });
        }

        return res.status(201).json({ msg: result[0],role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});


app.post('/api/emp/AdmincasesByDate', authenticateJwt, async (req, res) => {
    try {
      
        const { dateStart, dateEnd } = req.body;

        console.log(dateStart);
        console.log(dateEnd);

        if (!dateStart || !dateEnd) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

       
        
    

        const result = await connection.query(`SELECT t.*, o.organisationname AS organisation,e.empname AS employees,f.empname AS issued  FROM tickets t 
        LEFT JOIN organisation o ON t.organisationid=o.organcode
        LEFT JOIN employee e ON t.staffid=e.empid
        LEFT JOIN employee f ON t.issuedby=f.empid
        WHERE DATE(t.createdAt) BETWEEN ? AND ?`, [dateStart, dateEnd]);

        if (result[0].length === 0) {
            return res.status(201).json({ msg: [] });
        }

        return res.status(201).json({ msg: result[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});

app.post('/api/emp/casesByDate', authenticateJwt, async (req, res) => {
    try {
       
        const { dateStart, dateEnd } = req.body;

        console.log(dateStart);
        console.log(dateEnd);

        if (!dateStart || !dateEnd) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

        const { id } = req.headers;
        console.log(id,'id');
        
        const result = await connection.query(`SELECT t.*, o.organisationname AS organisation FROM tickets t 
        LEFT JOIN organisation o ON t.organisationid=o.organcode
        WHERE DATE(t.createdAt) BETWEEN ? AND ? AND t.staffid=? and t.ticketstatus=? `, [dateStart, dateEnd, id,"Pending"]);

        console.log(result[0]);
        if (result[0].length === 0) {
            return res.status(201).json({ msg: [] });
        }

        return res.status(201).json({ msg: result[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});


app.post('/api/emp/getFileData', authenticateJwt, async (req, res) => {
    try {
        const { ticketid } = req.body;

        if (!ticketid) {
            return res.status(401).json({ msg: "Plz Fill All Fields" });
        }

        const result = await connection.query('SELECT * FROM file WHERE ticketid=?', [ticketid]);

        if (result[0].length === 0) {
            return res.status(201).json({ msg: [] });
        }

        return res.status(201).json({ msg: result[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server Error' });
    }
});


// app.put('/api/emp/updateEmployees/:empid',authenticateJwt, (req,res)=>{
//     try {
//         const {empname,emppassword,emprole}=req.body

//         if(!empname || !emppassword || !emprole){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }

//         connection.query('update employee set empname=?,emppassword=?,emprole=? where empid=?',[empname,emppassword,emprole,req.params.empid],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              if(result.length!==0)
//                 res.status(201).json({msg:"Employee Details Updated"});
//             else
//             res.status(401).json({msg:"Employee Details NOT! Updated"});
//         })
        
            
//     }   
//     catch (error) {

//         console.log(err);
//        return res.status(500).json({msg:"Server Error"});
//     }
// });

// app.delete('/api/emp/deleteEmployees/:code',authenticateJwt, (req,res)=>{
//     try {
//         const {code}=req.params
//         if(!code){
//             res.status(401).json({msg:"Please Send a Valid Code!!"});
//             return
//         }
//        connection.query('delete from employee where empid=?',[code],(err,result)=>{
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ msg: 'Server Error' });
//          }
//          if(result.length!==0)
//          res.status(201).json({msg:"Employee Deleted"});
//         else
//         res.status(401).json({msg:"Employee NOT! Deleted"});  
//        })
       
//     } 
//     catch (error) {
//          console.log(err);
//        return res.status(500).json({msg:"Server Error"});
//     }
// });


// app.post('/api/emp/DashboardcasesByDate',authenticateJwt,async (req,res)=>{
//     try{       
       
//         const {dateStart,dateEnd}=req.body   
//         console.log(dateStart);
//         console.log(dateEnd);     
//         if(!dateStart || !dateEnd){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }
      
      
//         connection.query(`Select t.*,o.organisationname as organisation,e.empname as employees from tickets t 
//         left join organisation o on t.organisationid=o.organcode
//         left join employee e on t.staffid=e.empid
//         where DATE(t.createdAt) between ? and ?
//         ORDER BY t.createdAt ASC
//         `,[dateStart,dateEnd],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              console.log(result);
//              if(result.length===0)
//              return res.status(201).json({msg:[]});

//              res.status(201).json({msg:result});
//         })

//         // if(orderfilter==='1')
//         // s= await orders.find({orderDate: {$gte: dateStart, $lte: dateEnd},cId}).sort({oId:"desc"})  
//         // else
//         // s= await orders.find({deliveryDate: {$gte: dateStart, $lte: dateEnd},cId}).sort({oId:"desc"})  
//         //console.log(s);

//       }
//       catch(err){
//         console.log(err);
//         res.status(500).send({msg:"Server Error"});
//       }
// });



// app.post('/api/emp/casesByDate',authenticateJwt,async (req,res)=>{
//     try{       
//         console.log('hello');
//         const {dateStart,dateEnd}=req.body   
//         console.log(dateStart);
//         console.log(dateEnd);     
//         if(!dateStart || !dateEnd){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }
//         const {id}=req.headers
//         console.log(id);
      
//         connection.query(`Select t.*,o.organisationname as organisation from tickets t 
//         left join organisation o on t.organisationid=o.organcode
//         where DATE(t.createdAt) between ? and ? and t.staffid=?`,[dateStart,dateEnd,id],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ msg: 'Server Error' });
//              }
//              console.log(result);
//              if(result.length===0)
//              return res.status(201).json({msg:[]});

//              res.status(201).json({msg:result});
//         })

//         // if(orderfilter==='1')
//         // s= await orders.find({orderDate: {$gte: dateStart, $lte: dateEnd},cId}).sort({oId:"desc"})  
//         // else
//         // s= await orders.find({deliveryDate: {$gte: dateStart, $lte: dateEnd},cId}).sort({oId:"desc"})  
//         //console.log(s);

//       }
//       catch(err){
//         console.log(err);
//         res.status(500).send({msg:"Server Error"});
//       }
// });


// app.post('/api/emp/getFileData',authenticateJwt,async (req,res)=>{
//     try{       
      
//         const {ticketid}=req.body   
             
//         if(!ticketid){
//             res.status(401).json({ msg: "Plz Fill All Fields" });
//             return;
//         }
       
//         connection.query('Select * from file where ticketid=?',[ticketid],(err,result)=>{
//             if (err) {
//                 console.error(err);
//                 return res.status(401).json({ msg: 'Server Error' });
//              }
//              console.log(result);
//              if(result.length===0)
//              return res.status(201).json({msg:[]});

//              res.status(201).json({msg:result});
//         })

     
//       }
//       catch(err){
//         console.log(err);
//         res.status(500).json({msg:"Server Error"});
//       }
// });


app.use(express.static(path.join(__dirname, '../vite-project/dist')));

app.get('*', (req, res) =>
res.sendFile(
    path.resolve(__dirname, '../', 'vite-project', 'dist', 'index.html')
)
);

