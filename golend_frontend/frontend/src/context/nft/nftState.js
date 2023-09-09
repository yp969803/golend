import axios from "axios";
import { SERVER_URL ,REDIS_URL} from "../../constants";
import nftContext from "./nftContext";
import { useContext, useState } from "react";
import { ethers } from "ethers";
import { NFT_ADDRESS, MARKETPLACE_ADDRESS } from "../../constants";
import NftAbi from "../../abis/nft.json";
import MarketPlaceAbi from "../../abis/marketPlace.json";
import { fromWei,toWei } from "../../utils/nft";
import authContext from "../auth/authContext";

const NftState = (props) => {
  const [account, setAccount] = useState(null);
  let {setAlert}=useContext(authContext)

  const [signer, setSigner] = useState(null);
  const [Nft, setNft] = useState(null);
  const [listed,setListed]=useState(null);
  const [unlisted,setUnlisted]=useState(null);
  const [ItemSold,setItemSold]=useState(null);
  const [NftTransfer,setNftTransfer]=useState(null)
  const [Marketplace, setMarketplace] = useState(null);

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nft = new ethers.Contract(NFT_ADDRESS, NftAbi, signer);
    const marketPlace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketPlaceAbi,
      signer
    );
    const listedNft= await marketPlace.queryFilter('ItemListed')
    console.log(listedNft,'upsc')
    const itemUnlisted=await marketPlace.queryFilter('itemUnlisted')
    const itemSold=await marketPlace.queryFilter('ItemSold')
    const nftTransfer=await marketPlace.queryFilter('NFTTransfer')
    setItemSold(itemSold)
    setNftTransfer(nftTransfer)
    setListed(listedNft)
    setUnlisted(itemUnlisted)
    setSigner(signer);
    setAccount(accounts[0]);
    setMarketplace(marketPlace);
    setNft(nft);
  };




  const setMapping=async(email,address)=>{
    try{
      let response=axios.post(REDIS_URL+"/set",{
        email:email,
        address:address
      },{
        headers: {
          'content-type': 'application/json'
        }
      
      })
      return response
    
    }catch(e){
      console.log(e)
      
      
    }
    

  }

  const getEmail=async(Address)=>{
    
      try{
        let response=await axios.get(REDIS_URL+"/getEmail/"+Address);
        console.log(response)
        return response

      }catch(e){
        console.log(e)
      }
  }

  const getAddress=async(email)=>{
    try{
      let response=axios.get(REDIS_URL+"/getAddress/"+email)
      return response
    }catch(e){
      console.log(e)
    }
  }

  const buyNft=async(tokenId,price)=>{
      try{
        if(Marketplace&&signer){
          await Marketplace.connect(signer).buyItem(tokenId,{value:price})
          setAlert({message:"Nft buyed",type:"success"})
        }

      }catch(e){
        console.log(e)
        setAlert({message:"An error occured",type:"danger"})
      }
  }
  const takeOffer=async(tokenId,price)=>{
    try{
      if(Marketplace&&signer){
        await Marketplace.connect(signer).TakeOffer(tokenId,{value:price})
        setAlert({message:"Deal done",type:"success"})
      }

    }catch(e){
      console.log(e)
      setAlert({message:"An error occured",type:"danger"})
    }
   }
   const mintThenList = async (result) => {
   try{
    if(Marketplace&&Nft&&signer){
      await(await Nft.connect(signer).mint(result)).wait()
      
      await(await Nft.connect(signer).setApprovalForAll(Marketplace.address, true)).wait()
      const id = await Nft._tokenId()
      console.log(id)
      await(await Marketplace.connect(signer).listItem(Nft.address, parseInt(id.toString()))).wait()
      setAlert({message:'Nft minted and listed',type:"success"})
     }
   }catch(e){
    console.log(e)
    setAlert({message:'Some error occured',type:'danger'})
   }
  }



  return (
    <nftContext.Provider value={{ account, signer, Nft, Marketplace,web3Handler,setMapping,getEmail,getAddress, listed,unlisted ,buyNft,takeOffer,mintThenList,setListed,setUnlisted,setItemSold,ItemSold,setNftTransfer,NftTransfer}}>
      {props.children}
    </nftContext.Provider>
  );
};

export default NftState;
