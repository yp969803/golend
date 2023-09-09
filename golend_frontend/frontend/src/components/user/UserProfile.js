import React, { useContext, useEffect, useState } from "react";
import PersonsProfile from "./PersonsProfile";
import authContext from "../../context/auth/authContext";
import apiContext from "../../context/api/apiContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import nftContext from "../../context/nft/nftContext";
import Spinner from "../utils/Spinner";
import { PINATA_API,PINATA_SECRET } from "../../constants";


import UserProfileNft from "../nft/UserProfile";
const UserProfile = () => {
  const [token, setToken] = useState(null);
  const { checkLoginStatus } = useContext(authContext);
  const { onlineAt, getProfile } = useContext(apiContext);
  let { mintThenList } = useContext(nftContext);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
 
  const [file,setFile]=useState(null)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const uploadToIPFS = async () => {
    if (typeof file !== "undefined") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        console.log(formData)
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          maxContentLength: 'Infinity',
          headers: {
              'pinata_api_key': PINATA_API,
              'pinata_secret_api_key': PINATA_SECRET,
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`
          },
      });
      const image = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                // console.log(response.data.IpfsHash);
      await createNFT(image)

      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  const createNFT = async (image) => {
    
    if (!image || !name || !description) {
     
      return
    };
    try {
      
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
            "name": name,
            "description": description,
            "image": image
        },
        headers: {
            'pinata_api_key': PINATA_API,
            'pinata_secret_api_key': PINATA_SECRET,
        },
    });
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${resJSON.data.IpfsHash}`;
    
      await mintThenList(tokenURI);
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };

  async function fetchData() {
    let token = localStorage.getItem("token");

    setToken(token);
    if (token) {
      let bool = await checkLoginStatus(token);
      setUser(bool);
      console.log(bool);

      if (!bool) {
        return navigate("/login");
      }
    } else {
      return navigate("/login");
    }
  }

  let CreateHandler = async () => {
  
    await uploadToIPFS()
    setLoading(false);
    setDescription('')
    setFile(null)
    setName('')
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {user ? (
        <PersonsProfile token={token} email={user.email} bool={true} />
      ) : (
        <></>
      )}

      {loading ? (
        <Spinner message={"loading"} />
      ) : (
        <>
          <div className="container">
            <p
              class="text-success btn text-center fw-bolder btn btn-outline-danger"
              data-bs-toggle="modal"
              data-bs-target="#example"
            >
              MINT AND LIST NFT
            </p>

            <UserProfileNft/>
           
          </div>
          <div
            class="modal fade"
            id="example"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    Mint And List Nft
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">
                        Name
                      </span>
                    </div>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Name"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      value={name}
                      required
                      onChange={(e)=>setName(e.target.value)}
                    />
                  </div>
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">
                        Description
                      </span>
                    </div>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Desription"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      value={description}
                      required
                      onChange={(e)=>setDescription(e.target.value)}
                    />
                  </div>
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">
                        Image
                      </span>
                    </div>
                    <input
                      type="file"
                      class="form-control"
                      onChange={(e)=>{setFile(e.target.files[0])}}
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      required
                    />
                  </div>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={CreateHandler}
                  >
                    Mint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
