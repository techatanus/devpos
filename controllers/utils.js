const db = require('../util/db');
const bcrypt = require('bcrypt');



// function to capture user data

 const processRequest = async(req,res,next)=>{
    const {name,email,role} = req.body
    const Password = 'Ke@254';
    const hashedPass = bcrypt.hashSync(Password,10);

    // -----check if user exist before creating new user-------
    const user_exist = 'SELECT * FROM dev_users where u_email = ?';
      await db.query(user_exist,[email],(err,rs)=>{
            if(rs.length > 0){
               // ------user exists--------
               res.send('<script>alert("User with the email already exists")</script>')
               // console.log('User with the email already exists');
            }else{
               // proceed and create new user
               db.query('INSERT INTO dev_users(u_name,u_email,u_role,u_pass) VALUES(?,?,?,?)',[name,email,role,hashedPass],(error)=>{
                  if(error){
                  res.send('<script>alert("error uploading data")</script>')
                  }else{
                     db.query('SELECT * FROM dev_users',(err,rs)=>{
                           res.send('<script>alert("data inserted successful")</script>')
                        // res.render('./table',{persons : rs});
                     })
                  }
                  // res.send('<script>alert("data inserted successful")</script>')
                  //  console.log('data inserted successful');
                })
            }
      })
 }
//ADD PRODUCT FUNCTION TO THE DB

 const addProduct = async(req,res,next)=>{
          const {name,category,suplier,bp,sp,wp,stock,date} = req.body;
            const product_exist = 'SELECT * FROM products WHERE p_name =?';
            await db.query(product_exist,[name],(err,rs)=>{
                     if(rs.length > 0){
                        // ------product exists , stop exit the program----->
                        res.send('<script>alert("Prouct already exists")</script>')
                        // console.log('Prouct already exists');
                     }else{
                        // --------proceed and insert the product to the db----->
                        db.query('INSERT INTO products(p_name,p_category,p_suplier,p_bp,p_sp,p_wp,p_quantity,expD) VALUES(?,?,?,?,?,?,?,?)',[name,category,suplier,bp,sp,wp,stock,date],(err)=>{
                            if(err) {
                              console.log('error adding product')
                            }else{
                              db.query('SELECT * FROM products',(err,result)=>{
                                 if(err){
                                    console.log('error retrieving data');
                                     }else{
                                       db.query('SELECT * FROM p_categories',(err,rs)=>{
                                         if(err){
                                           console.log('error retrieving sample');
                                         }else{
                                           db.query('SELECT * FROM suppliers',(err,rss)=>{
                                             res.render('./table', {addedProduct : result, items : rs, sups:rss});
                                           })
                                         }
                                        })
                                     }
                                 // res.render('./table',{addedProduct : result});
                              })
                            }
                  
                        })
                     } 
            })

      }
      //add category
      const addCategory = async(req,res,next)=>{
      //   check if the category exist else create new category
      const {cname} = req.body
      console.log(req.body);
      const sql = 'SELECT * FROM p_categories WHERE name = ?';
      await db.query(sql,[cname],(err,rs)=>{
          if(rs.length > 0){
            
           res.send('<script>alert("category already exists!")</script>')
          }else{
           const addC = 'INSERT INTO p_categories(name) VALUES(?)';
           db.query(addC,[cname],(err)=>{
                if(err) throw err;
                res.send('<script>alert("category added successful")</script>')
           })
          }
      })

      }

// addsuppliers
const addsuppliers = async(req,res,next)=>{
   //capture supp detail,check if they exists and create new
   const {name,contact,phone,email} = req.body;
 
    const sql = 'SELECT * FROM suppliers WHERE s_name = ?';
    await db.query(sql,[name],(err,rs)=>{
        if(rs.length > 0){
          
         res.send('<script>alert("supplier already exists!")</script>')
        }else{
         const addC = 'INSERT INTO suppliers(s_name,s_contact,s_phone,s_email) VALUES(?,?,?,?)';
         db.query(addC,[name,contact,phone,email],(err,rs)=>{
              if(err){
      res.send('<script>alert("Error adding data")</script>')
              }else{
               db.query('SELECT * FROM suppliers',(err,rs)=>{
                  res.render('./supply', {newsupps : rs})
               })
              
              }
           
          
         })
        }
    })

}

// userAuthentication
const userAuthentication = async (req, res, next) => {
    const { name, password } = req.body;
    const sql = 'SELECT * FROM dev_users WHERE u_name = ?';
    
    await db.query(sql, [name], async (err, rs) => {
        if (err) {
            res.send('<script>alert("User with name do not exist")</script>');
        } else {
            const user = rs[0];
            if (user && bcrypt.compareSync(password, user.u_pass)) {
                // Fetch permissions based on the user's role
                const role = user.u_role; // Assuming the role is stored in `u_role`
                const permissionsSql = 'SELECT permission FROM d_access WHERE department = ?';
                
                await db.query(permissionsSql, [role], (err, permissionsResult) => {
                    if (err) {
                        res.send('<script>alert("Error fetching permissions")</script>');
                    } else {
                        const permissions = permissionsResult.map(row => row.permission);
                        
                        req.session.user = {
                            id: user.u_id,
                            username: user.u_name,
                            email: user.u_email,
                            role: role,
                            permissions: permissions // Store permissions in session
                        };
                        
                        const username = user.u_name;
                     
                        res.render('./index', { username });
                    }
                });
            } else {
                res.send('<script>alert("Invalid username or password")</script>');
            }
        }
    });
};

// userpermission
function checkPermission(permission) {
  return (req, res, next) => {
      if (req.session.user && req.session.user.permissions.includes(permission)) {
          next();
      } else {
          res.status(403).send('Forbidden');
      }
  };
}


// Sales_autosearch proucts
// const Sales_autosearch = async(req,res,next)=>{
  

// }


















//  import the functions
module.exports ={processRequest,addProduct,addCategory,addsuppliers,userAuthentication,checkPermission}
