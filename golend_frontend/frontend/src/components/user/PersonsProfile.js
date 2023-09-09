import React, { useContext, useEffect, useState } from "react";
import { AVATARAPI,AVATARURL } from "../../constants";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBTypography,
  MDBIcon,
} from "mdb-react-ui-kit";
import authContext from "../../context/auth/authContext";
import apiContext from "../../context/api/apiContext";



const PersonsProfile = ({ email, bool, token }) => {
  let { user,setAlert } = useContext(authContext);
  let { getProfile ,updateProfile} = useContext(apiContext);
  const [profile, setProfile] = useState();
  const [first,setFirst]=useState("")
  const [last,setLast]=useState("")
  let fetchProfile = async () => {
    if (user) {
      let response = await getProfile(email, token);

      if (response&&response.status == 200) {
        setProfile(response.data);
      } else {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  };
  let SaveHandler=async()=>{
    let respone=await updateProfile(email,first,last,token);
    if (respone&&respone.status==200){
        setAlert({message:"Name changed successfully",type:"success"})
    }
    else{
        setAlert({message:"Some error occured",type:"danger"})
    }
  }
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      <MDBContainer className="py-1 h-20">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol lg="6" className="mb-4 mb-lg-0">
            <MDBCard className="mb-3" style={{ borderRadius: ".5rem" }}>
              <MDBRow className="g-0">
                <MDBCol
                  md="4"
                  className="gradient-custom text-center text-white"
                  style={{
                    borderTopLeftRadius: ".5rem",
                    borderBottomLeftRadius: ".5rem",
                  }}
                >
                  <MDBCardImage
                    src={`${AVATARURL}${email}.png?apikey=${AVATARAPI}`}
                    alt="Avatar"
                    className="my-5"
                    style={{ width: "80px" }}
                    fluid
                  />

                  <MDBIcon far icon="edit mb-5" />
                </MDBCol>
                <MDBCol md="8">
                  <MDBCardBody className="p-4">
                    <MDBTypography tag="h6">Information</MDBTypography>
                    <hr className="mt-0 mb-4" />

                    <MDBRow className="pt-1">
                      <MDBCol size="6" className="mb-3">
                        <MDBTypography tag="h6">Email</MDBTypography>
                        <MDBCardText className="text-muted">
                          {profile ? profile.email : ""}
                        </MDBCardText>
                      </MDBCol>

                      <MDBCol size="6" className="mb-3">
                        <MDBTypography tag="h6">Name</MDBTypography>
                        <MDBCardText className="text-muted">
                          {profile ? profile.first_name : ""}{" "}
                          {profile ? profile.last_name : ""}{" "}
                         {bool? <i
                            className="fa-solid fa-pen-to-square btn"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            
                          ></i>:""}
                        </MDBCardText>
                      </MDBCol>
                    </MDBRow>
                  </MDBCardBody>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <div
        className="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Edit Name
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="">
                    First and last name
                  </span>
                </div>
                <input type="text" class="form-control" onChange={(e)=>{setFirst(e.target.value)}}/>
                <input type="text" class="form-control" onChange={(e)=>{setLast(e.target.value)}}/>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={SaveHandler} disabled={first.length==0||last.length==0}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonsProfile;
