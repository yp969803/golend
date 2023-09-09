import React, { useContext, useState,useEffect } from 'react'
import nftContext from '../../context/nft/nftContext';
import NftUserCard from './NftUserCard';
import NftHistoryUser from './NftHistoryUser';

const UserProfileNft = () => {
  let [nftList,setNftList]=useState([])
  let {setListed,setUnlisted,account,listed,unlisted,setItemSold,ItemSold,setNftTransfer,NftTransfer,Marketplace,Nft}=useContext(nftContext);
  const fetchData=async()=>{
    if(listed){
        console.log(listed)
        listed.map((e)=>{
          let tid=(e.args.tokenId).toString()
          let nft={tokenId:parseInt(tid) ,time:e.args.time}
          setNftList(nftList.concat(nft))
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
       fetchData()
       
  },[Marketplace,Nft])

  return (
    <div>
     <div className='container text-center'>
        <p>Users Nft's</p>
        <div className='row'>
          {nftList.map((elem)=>{
           
            return <NftUserCard key={Math.random()} tokenId={elem.tokenId} time={elem.time}/>
          })}
        </div>
        <p>Money Lended</p>
        <div className='row'>
          {nftList.map((elem)=>{
           return <NftHistoryUser key={Math.random()} tokenId={elem.tokenId} time={elem.time}/>
          })}
        </div>
      </div>   

    </div>
  )
}


export default UserProfileNft
