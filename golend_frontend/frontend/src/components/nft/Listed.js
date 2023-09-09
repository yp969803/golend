import React, { useContext, useEffect, useState } from "react";
import nftContext from "../../context/nft/nftContext";
import { Link } from "react-router-dom";
import authContext from "../../context/auth/authContext";
import { fromWei, toWei } from "../../utils/nft";
import Spinner from "../utils/Spinner";
const Listed = ({ item, time, metaData, bool }) => {
  let { getEmail, Marketplace, signer,Nft } = useContext(nftContext);
  let { setAlert } = useContext(authContext);
  let [owner, setOwner] = useState(null);
  let [soldPrice, setSoldPrice] = useState("");
  let [d,setD]=useState("")
  let [h,setH]=useState("")
   let [m,setM]=useState("")
   let [s,setS]=useState("")
   let [rate,setRate]=useState("")
   let [lendPrice,setLendPrice]=useState("")
  let [loading, setLoading] = useState(false);
  let fetchData = async () => {
    if (item) {
      console.log(item.owner,"chu")
      let response = await getEmail((item.owner).toLowerCase());
      console.log(response)
      if (response && response.status == 200) {
        setOwner(response.data.value);
      }
    }
  };
  let SaleHandler = async () => {
    try {
      if (Marketplace && signer && soldPrice.trim().length > 0) {
        setLoading(true)(
          await Marketplace.connect(signer).listForSale(
            item.id,
            toWei(soldPrice)
          )
        ).wait();
        setLoading(false);
        setAlert({ message: "Item listed for sale", type: "success" });
      }
    } catch (e) {
      console.log(e);
    }
  };
  let LendHandler = async () => {
    try {
      if (Marketplace && signer && d.trim().length > 0&&h.trim().length&&m.trim().length&&s.trim().length&&rate.trim()>0&&lendPrice.trim()>0) {
        var time = ((parseInt(d) * 86400) + (parseInt(h) * 3600) + (parseInt(m) * 60) + parseInt(s));  
        setLoading(true)(
          await Marketplace.connect(signer).listForLend(
            item.id,
            toWei(lendPrice),
            parseInt(rate),
            time
          )
        ).wait();
        setLoading(false);
        setAlert({ message: "Item listed for lend", type: "success" });
      }
    } catch (e) {
      console.log(e);
    }
  };

  let UnlistHamdler=async()=>{
    try{
      if(Marketplace&&Nft&&signer){
        setLoading(true)
        await (await Nft.connect(signer).burn(item.id)).wait()
        await (await Marketplace.connect(signer).burnNft(item.id)).wait()
        setLoading(false)
        setAlert({message:"Nft Burned",type:"success"})
        setD("")
        setH("")
        setM("")
        setS("")
        setRate("")
        setLendPrice("")
      }
    }catch(e){
      console.log(e)
    }
  }
  

  useEffect(() => {
    fetchData();
    console.log(metaData)
  }, [Marketplace,Nft]);

  if (loading) {
    return <Spinner message={"loading"} />;
  }
  return (
    <div className="card" style={{width: "18rem"}}>
      <img src={metaData.image} className="card-img-top" alt="..." />
      <div className="card-body">
      <h5 className="card-title">{metaData.name}</h5>
        <p>{metaData.description}</p>
        
        <p>Listed at: {Date(time)}</p>
       
        
        
        {!bool?<><Link to={owner ? `/anotherUser/${owner}` : ""}>
          {owner ? owner : ""}
        </Link>
        <Link
          to={owner ? `/privateChat/${owner}` : ""}
          className="btn btn-primary"
        >
          {owner ? "Chat" : ""}
        </Link></>:<></>}
        {bool ? (
          <div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">Price</span>
              </div>
              <input
                type="text"
                class="form-control"
                aria-label="Amount (to the nearest dollar)"
                value={soldPrice}
                onChange={(e) => {
                  setSoldPrice(e.target.value);
                }}
              />
              <div class="input-group-append">
                <span class="input-group-text">eth</span>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-outline-info"
              onSale={SaleHandler}
            >
              List for Sale
            </button>
          </div>
        ) : (
          <></>
        )}
        {bool ? (
          <div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  Price(in eth)
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                placeholder="Price"
                aria-label="Username"
                aria-describedby="basic-addon1"
                value={lendPrice}
                onChange={((e)=>setLendPrice(e.target.value))}
              />
            </div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  Rate
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                placeholder="Rate"
                aria-label="Username"
                aria-describedby="basic-addon1"
                value={rate}
                onChange={(e)=>setRate(e.target.value)}
              />
            </div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  TimeInterval
                </span>
              </div>
              D:
              <input type="text" id="days" value={d} onChange={(e)=>setD(e.target.value)} />
              H:
              <input type="text" id="hours" value={h} onChange={e=>setH(e.target.value)} />
              M:
              <input type="text" id="minutes" value={m} onChange={e=>setM(e.target.value)} />
              S:
              <input type="text" id="seconds" value={s} onChange={e=>setS(e.target.value)} />
              <br />
            </div>

            <button type="button" class="btn btn-outline-info" onClick={LendHandler}>
              List for Lend
            </button>
          </div>
        ) : (
          <></>
        )}
        {bool?<button type="button" class="btn btn-outline-danger" onClick={UnlistHamdler} >Burn and Unlist Nft</button>:<></>}
      </div>
    </div>
  );
};

export default Listed;
