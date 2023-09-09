import React, { useContext, useEffect, useState } from "react";
import nftContext from "../../context/nft/nftContext";
import { Link } from "react-router-dom";
import { fromWei, toWei } from "../../utils/nft";
import Spinner from "../utils/Spinner";
import { secondsToDhms } from "../../utils/nft";
import { ethers } from "ethers";
import authContext from "../../context/auth/authContext";
const NftMoneyLended = ({ item, time, metaData, lend, bool }) => {
  const [loading, setLoading] = useState(false);
  let { takeOffer, Marketplace, Nft, signer } = useContext(nftContext);
  let { getEmail } = useContext(nftContext);
  let { setAlert } = useContext(authContext);
  let [d, setD] = useState("");
  let [h, setH] = useState("");
  let [m, setM] = useState("");
  let [s, setS] = useState("");
  let [to, setTo] = useState("");
  let [rate, setRate] = useState("");
  let [lendPrice, setLendPrice] = useState("");
  let [owner, setOwner] = useState(null);
  let [currentDate, setCurrentDate] = useState(null);
  let [repaymentAmount, setRepaymentAmount] = useState("");
  let fetchData = async () => {
    if (item) {
      let response = getEmail((lend.owner).toLowerCase());
      if (response && response.status == 200) {
        setOwner(response.data.value);
      }
    }
    if (lend.time) {
      let response = getEmail((lend.to).toLowerCase());
      if (response && response.status == 200) {
        setTo(response.data.value);
      }
    }
  };
  useEffect(() => {
    fetchData();
    setCurrentDate(Date.now() / 1000);
  }, [Marketplace, Nft]);
  let TakeHandler = async () => {
    setLoading(true);
    await takeOffer(item.tokenId, lend.price);
    setLoading(false);
  };
  if (loading) {
    return <Spinner message={"loading"} />;
  }

 
  let moneyRepayment = async () => {
    if (Marketplace && signer && item&&moneyRepayment.trim()>0) {
      setLoading(true);
      await await Marketplace.connect(signer).moneyRepayment(item.tokenId, {
        value: toWei(moneyRepayment)
      }).wait();
      setLoading(false);
      setAlert({message:`${moneyRepayment} eth Repayed`})
      setRepaymentAmount("")
    }
  };
  let AskNft=async()=>{
    if(Marketplace&&Nft&&signer){
        setLoading(true)
        await (await Marketplace.connect(signer).NftAsk(item.tokenId)).wait()
        setLoading(false)
        setAlert({message:"Nft transfered to you",type:"success"})

    }
  }

  return (
    <div className="card" style="width: 18rem;">
      <img src={metaData.image} className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">{metaData.name}</h5>
        <p className="card-text">{metaData.description}</p>
        <p className="card-text">Price: {fromWei(lend.price)} eth</p>
        <p className="card-text">Rate: {lend.rate}%</p>
        <p className="card-text">
          TimeInterval: {secondsToDhms(lend.lendingTime)}
        </p>
        <p>Listed at: {new Date(parseInt(time))}</p>
        
        
            <Link to={owner ? `/anotherUser/${owner}` : ""}>
              owner: {owner ? owner : item.owner}
            </Link>
            <Link
              to={owner ? `/privateChat/${owner}` : ""}
              className="btn btn-primary"
            >
              {owner ? "Chat" : ""}
            </Link>
       
            <p className="card-text">Item Lended</p>
           
            <p className="card-text">
              Lended On: {Date(parseInt(lend.time))}
            </p>
            <p className="card-text">
              Money to Give: {fromWei(lend.moneyToGive)} eth
            </p>
            <p className="card-text">Money Given: {fromWei(lend.moneygiven)}</p>
            <p className="card-text">Money Given: {fromWei(lend.moneygiven)}</p>
            <p className="card-text">
              Time Left:{" "}
              {currentDate && parseInt(lend.time) + parseInt(lend.lendingTime) - currentDate >= 0
                ? secondsToDhms(parseInt(lend.time) + parseInt(lend.lendingTime) - currentDate)
                : "Time already gone"}
            </p>
         
            {currentDate-parseInt(lend.time)-parseInt(lend.lendingTime)>=0?<>
            
                <button type="button" class="btn btn-outline-danger" onClick={AskNft}>Ask Nft</button>

            </>:<></>}
       
      </div>
    </div>
  );
};

export default NftMoneyLended;
