// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GolendMarketplace  is ReentrancyGuard{


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    address immutable owner;
    uint public itemCount;



//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    struct Item{
        uint tokenId;
        IERC721 nft;
        address payable owner;
        bool forSale;
        bool forCollateral;
        uint price;
        bool isPresent;
    }
    
    struct ItemForLend{
        uint tokenId;
        address payable owner;
        address payable to;
        uint price;
        uint rate;
        uint lendingTime;
        uint moneygiven;
        uint timeLeft;
        uint moneytoGive;
        uint time;
        bool isPresent;
    }
    


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

   event ItemListed(uint indexed tokenId, address nftAddress, address indexed seller , string time);
   event ItemListedForSale(uint indexed tokenId, address indexed seller, uint price, string time);
   event ItemSold(uint indexed tokenId, address indexed seller, address indexed buyer, string time, uint price);
   event ChangedSellingPrice(uint indexed tokenId, uint oldPrice, uint newPrice, string time);
   event ItemListedForLend(uint indexed tokenId, address indexed seller, uint price, uint rate, string time);
   event ChangedLendingParameters(uint indexed tokenId, uint previousTime, uint newTime, uint previousRate, uint newRate, uint previousPrice, uint newPrice, string time);
   event LendOffer (uint indexed tokenId, address nftHolder, address moneyHolder  ,uint price, uint rate, string time, uint moneyToGive);
   event NFTTransfer(uint indexed tokenId, address to, address from, string time);
   event ItemUnlistedForSale(uint indexed _tokenId, address owner, string time);
   event ItemUnlistedForLend(uint indexed _tokenId, address owner, string time);
   event moneyTransfer(uint indexed _tokenId,address to, address from,uint value, string time);
   event moneyRefunded(uint indexed _tokenId,address to, uint value, string time);
   event MoneyRepayment(uint indexed _tokenId, address from, uint value, string time);
   event itemUnlisted(uint indexed _tokenId, address owner, string time);
   


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
     
     mapping(uint=>Item) public Items;
     mapping(uint=>ItemForLend) public LendedItems;

     

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    constructor(){
        owner=msg.sender;
    }


   receive() external payable nonReentrant{
      payable(msg.sender).transfer(msg.value);
      emit moneyRefunded(0, msg.sender, msg.value, Strings.toString(block.timestamp));

    }


    function listItem(IERC721 _nft,uint _tokenId) external nonReentrant{
        require(_nft.ownerOf(_tokenId)==msg.sender,"Wrong parameters given");
        Items[_tokenId]=Item(_tokenId,  _nft, payable(msg.sender), false, false,0,true);
        itemCount++;
        LendedItems[_tokenId]=ItemForLend(_tokenId, payable(msg.sender),payable(address(0)),0,0,0,0,0,0,0,true);
        emit ItemListed(_tokenId, address(_nft), msg.sender ,Strings.toString(block.timestamp)
);
        
    }

    function listForSale(uint _tokenId, uint price)external nonReentrant{

        Item storage item= Items[_tokenId];
        require(item.isPresent==true,"NFT does not exists");
        require(price>0,"Price of NFT should greater than 0");
        require(item.owner==payable(msg.sender),"Only owner of the nft can sell it"); 
        require(item.forSale==false&&item.forCollateral==false,"NFT already listed for sale or already listed for loan");
        item.forSale=true;
        item.price=price;
        emit ItemListedForSale(_tokenId, msg.sender, price, Strings.toString(block.timestamp));

    }
    
    function unlistForSale(uint _tokenId) external nonReentrant {
       Item storage item= Items[_tokenId];
       require(item.isPresent==true,"NFT does not exists");
       require(item.owner==payable(msg.sender),"Only owner of the nft can unlist it"); 
       require(item.forSale==true&&item.forCollateral==false,"NFT not listed for sale or already listed for loan");
       item.forSale=false;
       item.price=0;
       emit ItemUnlistedForSale(_tokenId, msg.sender,Strings.toString(block.timestamp));
    }

    function buyItem (uint _tokenId) external payable nonReentrant{
       Item storage item=Items[_tokenId];
       require(item.isPresent==true,"NFT does not exists");
       require(msg.value>=item.price,"Not enough money was provided");
       require(item.price>0&&item.forSale==true && item.forCollateral==false && item.owner!=payable(msg.sender),"You are buying wrong item");
       item.nft.transferFrom(item.owner, msg.sender, item.tokenId);
       emit NFTTransfer(_tokenId, msg.sender, item.owner, Strings.toString(block.timestamp));
       item.owner.transfer(item.price);
       emit moneyTransfer(_tokenId, item.owner, msg.sender,item.price ,Strings.toString(block.timestamp));
       if(msg.value>item.price){
        payable(msg.sender).transfer(msg.value-item.price);
        emit moneyRefunded(_tokenId, msg.sender, msg.value-item.price, Strings.toString(block.timestamp));
       }
       address seller=item.owner;
       uint price=item.price;
       item.owner=payable(msg.sender);
       item.forSale=false;
       item.price=0;
       emit ItemSold(_tokenId, seller, item.owner, Strings.toString(block.timestamp), price);

    }
    
    function changeSellingPrice(uint _tokenId , uint price) external nonReentrant{
        Item storage item=Items[_tokenId];
        require(item.isPresent==true,"NFT does not exists");
        require(price>0,"Price of NFT should greater than 0");
        require(item.owner==payable(msg.sender),"Only owner of the nft can change the selling price"); 
        require(item.forSale==true&&item.forCollateral==false,"Wrong nft chosen");
        uint oldPrice=item.price;
        item.price=price;
        emit ChangedSellingPrice(_tokenId, oldPrice, price, Strings.toString(block.timestamp));
        
        
    }

    
    function listForLend(uint _tokenId, uint price, uint rate, uint time) external nonReentrant{
        Item storage item=Items[_tokenId];
        ItemForLend storage itemLend=LendedItems[_tokenId];
        require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
        require(price>0,"Price should be greater than zero");
        require(item.forCollateral==false&&item.forSale==false&&item.owner==payable(msg.sender)&&itemLend.owner==payable(msg.sender)&&itemLend.to==payable(address(0)),"Wrong nft chosen");
        item.forCollateral=true;
        itemLend.price=price;
        itemLend.rate=rate;
        itemLend.lendingTime=time;
        itemLend.moneygiven=0;
        itemLend.moneytoGive=0;
        itemLend.timeLeft=0;
        emit ItemListedForLend(_tokenId, msg.sender, price, rate, Strings.toString(block.timestamp));
    }
    
    function unlistForLend(uint _tokenId) external nonReentrant{
        Item storage item=Items[_tokenId];
        ItemForLend storage itemLend=LendedItems[_tokenId];
        require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
        require(item.forCollateral==true&&item.forSale==false&&item.owner==payable(msg.sender)&&itemLend.owner==payable(msg.sender)&&itemLend.to==payable(address(0)),"Wrong nft chosen");
        item.forCollateral=false;
        itemLend.price=0;
        itemLend.rate=0;
        itemLend.lendingTime=0;
        itemLend.moneygiven=0;
        itemLend.moneytoGive=0;
        itemLend.timeLeft=0;
        emit ItemUnlistedForLend(_tokenId, msg.sender, Strings.toString(block.timestamp));
    }

   
    function ChangeLendingParameters(uint _tokenId,uint price, uint rate, uint time) external nonReentrant{
        Item storage item=Items[_tokenId];
        ItemForLend storage itemLend=LendedItems[_tokenId];
        require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
        require(price>0,"Price should be greater than zero");
        require(item.forCollateral==true&&item.forSale==false&&item.owner==payable(msg.sender)&&itemLend.owner==payable(msg.sender)&&itemLend.to==payable(address(0)),"Wrong nft chosen");
        uint previousPrice=itemLend.price;
        uint previousRate=itemLend.rate;
        uint previousTime=itemLend.lendingTime;
        itemLend.price=price;
        itemLend.rate=rate;
        itemLend.lendingTime=time;
        emit ChangedLendingParameters(_tokenId, previousTime, itemLend.lendingTime, previousRate, itemLend.rate, previousPrice, itemLend.price, Strings.toString(block.timestamp));
    }
    

    function TakeOffer(uint _tokenId) external payable nonReentrant{
         Item storage item=Items[_tokenId];
         ItemForLend storage itemLend=LendedItems[_tokenId];
         require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
         require(item.forCollateral==true&&item.forSale==false&&itemLend.to==payable(address(0)),"Wrong nft chosen");
         require(msg.value>=itemLend.price,"Not enough money is provided");
         
        item.nft.transferFrom(item.owner, address(this), item.tokenId);
        emit NFTTransfer(_tokenId, address(this), item.owner, Strings.toString(block.timestamp));
        item.owner.transfer(item.price);
        emit moneyTransfer(_tokenId, item.owner, msg.sender, itemLend.price ,Strings.toString(block.timestamp));
        if(msg.value>itemLend.price){
           emit moneyRefunded(_tokenId, msg.sender, msg.value-itemLend.price, Strings.toString(block.timestamp));
        }
        
         uint price=itemLend.price;
         uint rate=itemLend.rate;
         itemLend.to= payable(msg.sender);
         itemLend.moneygiven=0;
         itemLend.timeLeft=itemLend.lendingTime;
         itemLend.moneytoGive=price+(price*rate)/100;
         itemLend.time=block.timestamp;
         item.owner=payable(address(this));
         emit LendOffer(_tokenId, itemLend.owner, itemLend.to, price, rate, Strings.toString(block.timestamp),itemLend.moneytoGive);

    }

    function NftAsk(uint _tokenId) external nonReentrant{
         Item storage item=Items[_tokenId];
         ItemForLend storage itemLend=LendedItems[_tokenId];
         require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
         require(item.forCollateral==true&&item.forSale==false&&itemLend.to==payable(msg.sender),"Wrong nft chosen");
         require(block.timestamp>itemLend.time+itemLend.lendingTime,"Time is left for the rebate");
         require(itemLend.moneytoGive>itemLend.moneygiven,"Money already given");
         item.nft.transferFrom(address(this), msg.sender, item.tokenId);
         emit NFTTransfer(_tokenId, address(this), item.owner, Strings.toString(block.timestamp));
         if(itemLend.moneygiven>0){
            itemLend.owner.transfer(itemLend.moneygiven);
            emit moneyRefunded(_tokenId, msg.sender, itemLend.moneygiven, Strings.toString(block.timestamp));
         }
         address from=itemLend.owner;
         item.owner=payable(msg.sender);
         itemLend.owner=payable(msg.sender);
         item.price=0;
         item.forCollateral=false;
         itemLend.price=0;
         itemLend.to=payable(address(0));
         itemLend.rate=0;
         itemLend.time=0;
         itemLend.lendingTime=0;
         itemLend.moneygiven=0;
         itemLend.moneytoGive=0;
         itemLend.timeLeft=0;
         emit NFTTransfer(_tokenId, msg.sender, from, Strings.toString(block.timestamp));
    }



    function refundAsk(uint _tokenId) external nonReentrant{
        Item storage item=Items[_tokenId];
        ItemForLend storage itemLend=LendedItems[_tokenId];
        require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
        require(item.forCollateral==true&&item.forSale==false&&itemLend.owner==payable(msg.sender)&&itemLend.to!=payable(address(0)),"Wrong nft chosen");
        require(itemLend.moneygiven<itemLend.moneytoGive,"Already given all the money");
          item.nft.transferFrom(address(this), msg.sender, item.tokenId);
         emit NFTTransfer(_tokenId, address(this), item.owner, Strings.toString(block.timestamp));
         if(itemLend.moneygiven>0){
            itemLend.owner.transfer(itemLend.moneygiven);
            emit moneyRefunded(_tokenId, msg.sender, itemLend.moneygiven, Strings.toString(block.timestamp));
         }
         address from=itemLend.owner;
         item.owner=payable(msg.sender);
         itemLend.owner=payable(msg.sender);
         item.price=0;
         item.forCollateral=false;
         itemLend.price=0;
         itemLend.to=payable(address(0));
         itemLend.rate=0;
         itemLend.time=0;
         itemLend.lendingTime=0;
         itemLend.moneygiven=0;
         itemLend.moneytoGive=0;
         itemLend.timeLeft=0;
         emit NFTTransfer(_tokenId, msg.sender, from, Strings.toString(block.timestamp));

    }


    
    function moneyRepayment(uint _tokenId) external payable nonReentrant{
       Item storage item=Items[_tokenId];
       ItemForLend storage itemLend=LendedItems[_tokenId];
       require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
       require(item.forCollateral==true&&item.forSale==false&&itemLend.owner==payable(msg.sender)&&itemLend.to!=payable(address(0)),"Wrong nft chosen");
       if(itemLend.time+itemLend.lendingTime>=block.timestamp&&msg.value+itemLend.moneygiven<itemLend.moneytoGive){
        itemLend.moneygiven=itemLend.moneygiven+msg.value;
        itemLend.timeLeft=itemLend.lendingTime-(block.timestamp-itemLend.time);
        emit MoneyRepayment(_tokenId, msg.sender, msg.value,Strings.toString(block.timestamp) );
       }
       else if(itemLend.time+itemLend.lendingTime>=block.timestamp&&msg.value+itemLend.moneygiven>=itemLend.moneytoGive){
          if(msg.value+itemLend.moneygiven>itemLend.moneytoGive){
            payable(msg.sender).transfer(msg.value+itemLend.moneygiven-itemLend.moneytoGive);
            emit moneyRefunded( _tokenId,msg.sender,msg.value+itemLend.moneygiven-itemLend.moneytoGive , Strings.toString(block.timestamp));
          }
          item.nft.transferFrom( msg.sender, address(this), item.tokenId);
          emit NFTTransfer( _tokenId, msg.sender, address(this), Strings.toString(block.timestamp));
          itemLend.to.transfer(itemLend.moneytoGive);
          emit moneyTransfer(_tokenId,itemLend.to,itemLend.owner,itemLend.moneytoGive,Strings.toString(block.timestamp));
          item.owner=payable(msg.sender);
          item.price=0;
          item.forCollateral=false;
          itemLend.owner=payable(msg.sender);
          itemLend.price=0;
          itemLend.to=payable(address(0));
          itemLend.rate=0;
          itemLend.time=0;
          itemLend.lendingTime=0;
          itemLend.moneygiven=0;
          itemLend.moneytoGive=0;
          itemLend.timeLeft=0;
          
          
       }
       else if(itemLend.time+itemLend.lendingTime>block.timestamp){
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
         emit NFTTransfer(_tokenId, address(this), item.owner, Strings.toString(block.timestamp));
         if(itemLend.moneygiven>0){
            itemLend.owner.transfer(itemLend.moneygiven);
            emit moneyRefunded(_tokenId, msg.sender, itemLend.moneygiven, Strings.toString(block.timestamp));
         }
         address from=itemLend.owner;
         item.owner=payable(msg.sender);
         itemLend.owner=payable(msg.sender);
         item.price=0;
         item.forCollateral=false;
         itemLend.price=0;
         itemLend.to=payable(address(0));
         itemLend.rate=0;
         itemLend.time=0;
         itemLend.lendingTime=0;
         itemLend.moneygiven=0;
         itemLend.moneytoGive=0;
         itemLend.timeLeft=0;
         emit NFTTransfer(_tokenId, msg.sender, from, Strings.toString(block.timestamp));
       }
       
    }

    function burnNft(uint _tokenId) external nonReentrant{
       Item storage item=Items[_tokenId];
       ItemForLend storage itemLend=LendedItems[_tokenId];
       require(item.isPresent==true&&itemLend.isPresent==true,"Nft does not exists");
       require(item.forCollateral==false&&item.forSale==false,"Nft alredy listed for sale or lend");
       require(item.nft.ownerOf(_tokenId)==msg.sender,"Only nft owner can burn it");
       item.isPresent=false;
       itemLend.isPresent=false;
       emit itemUnlisted(_tokenId, msg.sender, Strings.toString(block.timestamp));
       itemCount--;
       
    }


}