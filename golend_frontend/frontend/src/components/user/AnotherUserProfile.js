import React, { useContext,useEffect, useState } from 'react'
import PersonsProfile from './PersonsProfile'
import authContext from '../../context/auth/authContext'
import apiContext from '../../context/api/apiContext'
import { useNavigate, useParams } from 'react-router-dom'
import nftContext from '../../context/nft/nftContext'
import NftCard from '../nft/NftCard'
const UserProfile = () => {
    const [token,setToken]=useState(null)
    const {checkLoginStatus}=useContext(authContext)
    const {onlineAt,getProfile}=useContext(apiContext)
    const [user,setUser]=useState(null)
    const [profile,setProfile]=useState()
    const [nftList,setNftList]=useState([])
    const [userAccont,setUserAccount]=useState(null)
    let {listed,unlisted,setListed,setUnlisted,getAddress,Marketplace} = useContext(nftContext);
    const navigate=useNavigate();
    let {email}=useParams()
    async function fetchData(){
       let token =localStorage.getItem("token");
        
       setToken(token)
        if (token) {
          let bool = await checkLoginStatus(token);
          let response=await getAddress(email)
          if(response&&response.status==200){
            setUserAccount(response.data.value)
          }
          setUser(bool)
          console.log(bool)
        
          if (!bool) {
            return navigate("/login");
          }
        }
        else{
            return navigate("/login")
        }
     }
  let setNft=async()=>{
    if(listed){
      console.log(listed)
      listed.map(async(e)=>{
        let tid=(e.args.tokenId).toString()
        let nft={tokenId:parseInt(tid) ,time:e.args.time}
        if(Marketplace&&userAccont){
          let item=await Marketplace.Items(parseInt(tid))
          let itemForlend=await Marketplace.LendedItems(parseInt(tid))
          if(item.owner==userAccont||itemForlend.owner==userAccont){
            setNftList(nftList.concat(nft))
          }
        }
        

      })
    }
    if(unlisted){
      unlisted.map((e)=>{
        var withoutToken = nftList.filter((el)=>{
          let tid=(e.args.tokenId).toString()
          let intid=parseInt(tid)
         
          return intid != el.tokenId
        });
        setNftList(withoutToken)
      })
    }
  }
      

    useEffect(()=>{
        
       fetchData();
       
      
       
       
    },[setListed,setNftList,listed,unlisted])
    

  return (
    <div>
    {user?<PersonsProfile token={token} email={email} bool={false} />:<></>}
    <div className="container text-center">
      <p>His Nft's</p>
        <div className="row">
          {
            nftList.map(elem=>{
              return <NftCard tokenId={elem.tokenId} time={elem.time}/>
            })
          }
        </div>

      </div>
    </div>
    
  )
}

export default UserProfile
