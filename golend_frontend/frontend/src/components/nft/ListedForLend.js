import React, { useContext, useEffect, useState } from "react";
import nftContext from "../../context/nft/nftContext";
import { Link } from "react-router-dom";
import { fromWei, toWei } from "../../utils/nft";
import Spinner from "../utils/Spinner";
import { secondsToDhms } from "../../utils/nft";
import { ethers } from "ethers";
// import { secondsToDhms } from '../../utils/nft'
import authContext from "../../context/auth/authContext";
const ListedForLend = ({ item, time, metaData, lend, bool }) => {
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
      let response = getEmail(lend.to);
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

  let refundAsk = async () => {
    if (Marketplace && signer && item) {
      setLoading(true);
      await (await Marketplace.connect(signer).refundAsk(item.tokenId)).wait();
      setLoading(false);
    }
  };
  let moneyRepayment = async () => {
    if (Marketplace && signer && item&&moneyRepayment.trim()>0) {
      setLoading(true);
      await await Marketplace.connect(signer).moneyRepayment(item.id, {
        value: toWei(moneyRepayment)
      }).wait();
      setLoading(false);
      setAlert({message:`${moneyRepayment} eth Repayed`})
      setRepaymentAmount("")
    }
  };

  let LendHandler = async () => {
    try {
      if (
        Marketplace &&
        signer &&
        d.trim().length > 0 &&
        h.trim().length &&
        m.trim().length &&
        s.trim().length &&
        rate.trim() > 0 &&
        lendPrice.trim() > 0
      ) {
        var time =
          parseInt(d) * 86400 +
          parseInt(h) * 3600 +
          parseInt(m) * 60 +
          parseInt(s);
        setLoading(true)(
          await Marketplace.connect(signer).ChangeLendingParameters(
            item.tokenId,
            toWei(lendPrice),
            parseInt(rate),
            time
          )
        ).wait();
        setLoading(false);
        setAlert({
          message: "Nft lending Parameters Changed",
          type: "success",
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  let UnlendHandler = async () => {
    try {
      if (Marketplace) {
        setLoading(true);
        await (await Marketplace.connect(signer).unlistForLend(item.tokenId)).wait();
        setLoading(false);
        setAlert({ message: "Nft unlisted for lend" });
      }
    } catch (e) {
      console.log(e);
    }
  };
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
        <p>Listed at: { Date(parseInt(time))}</p>
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
          </>
        ) : (
          <></>
        )}
        {!bool && lend.time == 0 ? (
          <button type="button" class="btn btn-success" onClick={TakeHandler}>
            Take Offer
          </button>
        ) : (
          <p className="card-text">Offer already taken by someone</p>
        )}
        {bool && lend.time == 0 ? (
          <>
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
                  onChange={(e) => setLendPrice(e.target.value)}
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
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">
                    TimeInterval
                  </span>
                </div>
                D:
                <input
                  type="text"
                  id="days"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                />
                H:
                <input
                  type="text"
                  id="hours"
                  value={h}
                  onChange={(e) => setH(e.target.value)}
                />
                M:
                <input
                  type="text"
                  id="minutes"
                  value={m}
                  onChange={(e) => setM(e.target.value)}
                />
                S:
                <input
                  type="text"
                  id="seconds"
                  value={s}
                  onChange={(e) => setS(e.target.value)}
                />
                <br />
              </div>
              <button
                type="button"
                class="btn btn-outline-info"
                onClick={LendHandler}
              >
                Change Lending Parameters
              </button>
            </div>
            <button
              type="button"
              class="btn btn-outline-info"
              onClick={UnlendHandler}
            >
              Unlist From Lending
            </button>
          </>
        ) : (
          <></>
        )}
        {bool && lend.time != 0 ? (
          <>
            <p className="card-text">Item Lended</p>
            <p className="card-text">
              Lended to:
              <Link to={to ? `/anotherUser/${to}` : ""}>
                owner: {to ? to : lend.to}
              </Link>
              <Link
                to={to ? `/privateChat/${to}` : ""}
                className="btn btn-primary"
              >
                {to ? "chat" : ""}
              </Link>
            </p>
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
            <div class="form-outline">
              <input type="text" id="form12" class="form-control" value={repaymentAmount} onChange={(e)=>{setRepaymentAmount(e.target.value)}}/>
              <label class="form-label" for="form12">
                Amount in Ethers
              </label>
            </div>
            <button
              type="button"
              class="btn btn-outline-success"
              onClick={moneyRepayment}
            >
              Money Repayment
            </button>
            <button
              type="button"
              class="btn btn-outline-danger"
              onClick={refundAsk}
            >
              Refund Ask
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ListedForLend;
