import React, { useEffect,useState,useContext } from 'react'
import Listed from './Listed';
import ListedForSale from './ListedForSale';
import ListedForLend from './ListedForLend';
import nftContext from '../../context/nft/nftContext';
const NftUserCard = ({tokenId,time}) => {
    const [item,setItem]=useState(null);
    const [lend,setLend]=useState(null)
    const [Metadata,setMetadata]=useState(null)
    let {Nft, Marketplace,getEmail,account}=useContext(nftContext)
    let fetchNft=async()=>{
        if(Marketplace&&Nft){
            try{
            const uri=await Nft.tokenURI(tokenId)
            const response=await fetch(uri)
            const metaData=await response.json();
            const Item=await Marketplace.Items(tokenId);
            
            if(Item.forCollateral){
                const lendItem=await Marketplace.LendedItems(tokenId)
                setLend(lendItem)
            }
            console.log(Item)
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
     
      if(item&&item.forCollateral&&(lend.owner).toLowerCase()!=account){
        return
      }
      if(account&&item&&!item.forCollateral&&(item.owner).toLowerCase()!=account){
        
        return
      }
      
  return (
    <div className='col col-md-4'>
       {item&&Metadata&&!item.forSale&&!item.forCollateral&&<Listed item={item} time={time} metaData={Metadata} bool={true}/>}
       {item&&Metadata&&item.forSale&&<ListedForSale item={item} time={time} bool={true} metaData={Metadata}/>}
       {item&&Metadata&&lend&&item.forCollateral&&<ListedForLend item={item} lend={lend} metaData={Metadata} time={time} bool={true}/>}
    </div>
  )
}

export default NftUserCard
