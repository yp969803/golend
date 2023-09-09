import React, { useContext, useState, useEffect } from "react";
import nftContext from "../../context/nft/nftContext";
import { Link } from "react-router-dom";
import { fromWei, toWei } from "../../utils/nft";
import Spinner from "../utils/Spinner";
import authContext from "../../context/auth/authContext";
const ListedForSale = ({ item, time, metaData, bool }) => {
  const [loading, setLoading] = useState(false);
  const [changePrice, setChangePrice] = useState("");
  let {setAlert}=useContext(authContext)
  let { buyNft ,Marketplace,Nft,signer} = useContext(nftContext);
  let { getEmail } = useContext(nftContext);
  let [owner, setOwner] = useState(null);
  let fetchData = async () => {
    if (item) {
      let response = getEmail((item.owner).toLowerCase());
      if (response && response.status == 200) {
        setOwner(response.data.value);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  let BuyHandler = async () => {
    setLoading(true);
    await buyNft(item.tokenId, item.price);
    setLoading(false);
  };
  if (loading) {
    return <Spinner message={"loading"} />;
  }
 let ChangedPriceHandler=async()=>{
  try{
    if(Marketplace&&Nft&&signer&&changePrice.trim()>0){
      setLoading(true)
      await(await Marketplace.connect(signer).changeSellingPrice(item.id,toWei(changePrice))).wait()
      setLoading(false)
      setChangePrice("")
      setAlert({message:"Item price changed",type:'success'})
    }
  }catch(e){
    console.log(e)
  }
 }
 let UnlistHandler=async()=>{
  try{
   if(Marketplace&&Nft&&signer){
    setLoading(true)
    await (await Marketplace.connect(signer).unlistForSale(item.tokenId)).wait()
    setLoading(false)
    
    setAlert({message:"Item Unlisted for sale",type:'success'})
   }
  }catch(e){
    console.log(e)
  }
 }
  return (
    <div className="card" style="width: 18rem;">
      <img src={metaData.image} className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">{metaData.name}</h5>
        <p className="card-text">{metaData.image}</p>
        <p className="card-text">Price: {fromWei(item.price)} eth</p>
        <p>Listed at: {Date(parseInt(time))}</p>
        {!bool ? (
          <>
            <Link to={owner ? `/anotherUser/${owner}` : ""}>
              owner: {owner ? owner : item.owner}
            </Link>
            <Link
              to={owner ? `/privateChat/${owner}` : ""}
              className="btn btn-primary"
            >
              {owner ? owner : ""}
            </Link>
            <button type="button" class="btn btn-success" onClick={BuyHandler}>
              Buy Nft
            </button>
          </>
        ) : (
          <></>
        )}
        {bool ? (
          <>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input
                type="text"
                class="form-control"
                aria-label="Amount (to the nearest dollar)"
                value={changePrice}
                onChange={(e) => setChangePrice(e.target.event)}
              />
              <div class="input-group-append">
                <span class="input-group-text">eth</span>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-outline-primary"
             onChange={ChangedPriceHandler}
            >
              Change Selling Price
            </button>
            <button type="button" class="btn btn-outline-secondary" onClick={UnlistHandler}>
              Unlist From Sale
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ListedForSale;
