var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const { Pool, Client } = require('pg')
console.log("atsaya")

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'webservices',
    port: 5432,
  })
  pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
  })
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'webservices',
    port: 5432,
  })
  client.connect()

app.use(express.static('public'));
app.get('/exphtml.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "exphtml.htm" );
})

app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
   response = {
      email:req.query.email,
      psw:req.query.psw,
      option:req.query.option,
      reserve:req.query.reserve
   };
   console.log(response.email);
  val1= response.email;
  val2=response.psw;
  val3=response.option;
  val4=response.reserve;
  var d = new Date();
  n1 = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
  n2 = d.getTime();
  console.log(n1);
  if(val3=="book" || val3=="reserve"){
    console.log(val1,val2,n1,n2);    
    if(val3=="book"){
      const text = 'select * from public.parking where date=$1'
      const values = [n1]
      client.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {        
        if(res.rows[0].empty>0){
          const text = 'INSERT INTO public.user(email, pass, date, time) VALUES($1, $2, $3, $4) RETURNING *'
          const values = [val1, val2, n1, n2]
          client.query(text, values, (err, res) => {
            if (err) {
              console.log(err.stack)
            } else {
              console.log(res.rows[0])
            }
          })
          const text1='UPDATE public.PARKING set empty=empty-1 where date=$1 and empty>0 RETURNING *'
          const values1=[n1]
          client.query(text1, values1, (err, res) => {
            if (err) {
              console.log(err.stack)
            } else {
              console.log(res.rows[0])
            }
          })
        }else{
          console.log("no slots avl");
        }             
       }
     })
     res.end(JSON.stringify(response));
    }else{
      const text = 'INSERT INTO public.user(email, pass, date, time) VALUES($1, $2, $3, $4) RETURNING *'
      const values = [val1, val2,val4,n2]
      client.query(text, values, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0])
        }
      })
      const text1='UPDATE public.PARKING set empty=empty-1 where date=$1 and empty>0 RETURNING *'
      const values1=[val4]
      client.query(text1, values1, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0])
        }
      })
        res.end("reseved"+JSON.stringify(response));
    }       
  }else if(val3=="cancel"){
    console.log("close:"+val1,val2,n1,n2);
    const text = 'select * from public.user where email=$1'
    const values = [val1]
    client.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0].date);
        const text1='UPDATE public.PARKING set empty=empty+1 where date=$1 RETURNING *'
        const values1=[res.rows[0].date]
        client.query(text1, values1, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log(res.rows[0])
          }
        })
        const text2 = 'Delete from public.user where email=$1 RETURNING * '
        const values2 = [val1]
        client.query(text2, values2, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log(res.rows[0])
          }
        })
        
      }        
    }) 
    res.end("cancelled bill :10");
  }else if(val3=="close"){
    console.log("close:"+val1,val2,n1,n2);
    const text = 'select * from public.user where email=$1'
    const values = [val1]
    t1=0;
    diff=0;
    client.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        if(Math.round((n2-res.rows[0].time)/(1000*60*60))<0){
          console.log("100");    
        }else{
          console.log(Math.round((n2-res.rows[0].time)/(1000*60*60))*100);
        }
        const text1='UPDATE public.PARKING set empty=empty+1 where date=$1 RETURNING *'
        const values1=[res.rows[0].date]
        client.query(text1, values1, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log(res.rows[0])
          }
        })
        const text2 = 'Delete from public.user where email=$1 RETURNING * '
        const values2 = [val1]
        client.query(text2, values2, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log(res.rows[0])
          }
        })
        
      }        
    })    
    res.end("closed !! your bill :"+100);  
  }
  

})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})




