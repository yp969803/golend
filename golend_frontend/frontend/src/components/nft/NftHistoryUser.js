import React, { useEffect,useContext,useState } from 'react'
import Listed from './Listed';
import ListedForSale from './ListedForSale';
import ListedForLend from './ListedForLend';
import nftContext from '../../context/nft/nftContext';
import NftMoneyLended from './NftMoneyLended';

const NftHistoryUser = ({tokenId,time}) => {
    const [item,setItem]=useState(null);
    const [lend,setLend]=useState(null)
    const [Metadata,setMetadata]=useState(null)
    let {Nft, Marketplace,getEmail,account}=useContext(nftContext)
    let fetchNft=async()=>{
        if(Marketplace&&Nft){
            try{
            const uri=await Nft.tokenURI(tokenId)
            const response=await fetch(uri)
            const metaData=response.json();
            const Item=await Marketplace.Items(tokenId);
            if(Item.forCollateral){
                const lendItem=await Marketplace.LendedItems(tokenId)
                setLend(lendItem)
            }
            setItem(Item)
            setMetadata(metaData)
            }catch(e){
              console.log(e)
            }
    
        }
      }
     


      useEffect(()=>{
        fetchNft()
      },[account])
      if(item&&item.forCollateral&&lend.to==account){
        
      }
      else{
        return
      }
      
  return (
    <div className='col col-md-4'>
       {item&&lend&&Metadata&&<NftMoneyLended item={item} lend={lend} time={time} metaData={Metadata} />}   
    </div>
  )
}

export default NftHistoryUser
