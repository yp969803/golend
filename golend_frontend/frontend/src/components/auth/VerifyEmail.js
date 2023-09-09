import React, { useContext, useEffect} from 'react'
import authContext from '../../context/auth/authContext'
import { useNavigate,useParams } from 'react-router-dom';

const VerifyEmail = ({match}) => {
    let navigate = useNavigate()
    const {verificationCode} = useParams();
    async function fetchData(){
        let token = localStorage.getItem("token");
        if (token) {
          let bool = await checkLoginStatus(token);
          if (bool) {
            return navigate("/");
          }
        }
      }
    let {verifyEmail,setAlert,checkLoginStatus}=useContext(authContext);
    let emailVerify=async()=>{
        let response=await verifyEmail(verificationCode);
        if(response.status==200){
            setAlert({message:"Email successfully verified",type:"success"})
            
        }
        else{
            
          if(response.data.error){
            setAlert({message:response.data.error,type:"danger"})
           
          }
          else if(response.data.message){
            setAlert({message:response.data.message,type:"danger"})
           
          }
          else{
            setAlert({message:"Some error occured",type:"danger"})
           
          }
        }
    }
    useEffect(()=>{
     fetchData()
     emailVerify()
    },[])
  return (
    <div>
        <h3 className="text-center ">
        GoLend
        <small className="text-body-secondary"> Sell Buy Lend NFTs</small>
      </h3>
       <div className='container my-4 p-4'>
       <h1 class="display-2">Thankyou for Signing to GoLend</h1>
      

       </div>
      
    </div>
  )
}

export default VerifyEmail
