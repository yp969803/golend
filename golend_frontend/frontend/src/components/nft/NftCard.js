import React, { useContext, useEffect ,useState} from "react";
import nftContext from "../../context/nft/nftContext";
import ListedForSale from "./ListedForSale";
import ListedForLend from "./ListedForLend";
import Listed from "./Listed";
import axios from "axios";

const NftCard = ({tokenId,time}) => {
  let {Nft, Marketplace,getEmail}=useContext(nftContext)
  const [item,setItem]=useState(null)
  const [Metadata,setMetadata]=useState(null)
  const [lend,setLend]=useState(null)
  let fetchNft=async()=>{
    if(Marketplace&&Nft){
        try{
          const uri=await Nft.tokenURI(tokenId)
         
      
        const response=await fetch(uri,{
          mode:'cors'
        })
        const metaData=await response.json();
        console.log(metaData)
        const Item=await Marketplace.Items(tokenId);
        console.log(Item.tokenId.toString())
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
  },[Nft,Marketplace])
  return (
    <div className="col col-md-4">
      {item&&Metadata&&item.forSale&&<ListedForSale item={item} time={time} metaData={Metadata} bool={false}/>}
      {item&&lend&&Metadata&&item.forCollateral&&<ListedForLend item={item} time={time} lend={lend} metaData={Metadata} />}
      {item&&Metadata&&(!item.forSale&&!item.forCollateral)&&<Listed item={item} time={time} metaData={Metadata}/>}
    </div>
  );
};

export default NftCard;
