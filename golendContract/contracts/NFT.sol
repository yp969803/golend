//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
contract GolendNFT is ERC721URIStorage{
   
   uint public _tokenId;
   constructor()ERC721("GolendNFT", "GNFT") {}
   event NftMinted(uint tokenId , address owner, string url, string time);
   event NftBurnt(uint tokenId,address owner, string time);
   function mint(string memory tokenURI) external returns(uint){
     _tokenId++;
    uint256 newItemId = _tokenId;
    _safeMint(msg.sender, newItemId);
     _setTokenURI(newItemId,tokenURI);
    
    
     emit NftMinted(newItemId, msg.sender, tokenURI, Strings.toString(block.timestamp));
      return newItemId;
   }
   function burn(uint _TokenId)external {
    require(_exists(_TokenId),"Nft does not exists");
    require(ownerOf(_TokenId)==msg.sender,"Only owner can burn it");
    _burn(_tokenId);
    emit NftBurnt(_TokenId, msg.sender,Strings.toString(block.timestamp));
   }
}


