const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num)=> { 
  let eth=ethers.utils.formatEther(num)
  return parseFloat(eth)
}

describe("NFTMarketplace",async()=>{
  
  let loadFixture=async()=>{
     let NFT= await ethers.getContractFactory("GolendNFT")
     let Marketplace= await ethers.getContractFactory("GolendMarketplace")
     let[deployer,addr1,addr2]=  await ethers.getSigners()
     let nft=await NFT.deploy()
     await nft.deployed()
     let marketplace=await Marketplace.deploy()
     await marketplace.deployed()
     console.log({nftAddress:nft.address,marketPlaceAddress:marketplace.address})
     return {NFT,nft,Marketplace,marketplace, deployer, addr1, addr2}
  }

  let AnotherLoadFixture=async()=>{
    let NFT= await ethers.getContractFactory("GolendNFT")
     let Marketplace= await ethers.getContractFactory("GolendMarketplace")
     let[deployer,addr1,addr2]=  await ethers.getSigners()
     let nft=await NFT.deploy()
     await nft.deployed()
     let marketplace=await Marketplace.deploy()
     await marketplace.deployed()
     await nft.connect(addr1).mint("Monkey");
     await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
     await marketplace.connect(addr1).listItem(nft.address,1)
        
     item=await marketplace.Items(1);
          
     return {NFT,nft,Marketplace,marketplace, deployer, addr1, addr2,item}
  }
  
  describe("It shoud track the name and symbol of NFT",()=>{
    
    it("Should track the name and symbol of nft collection",async()=>{
      let {nft}=await loadFixture()
      expect(await nft.name()).to.equal("GolendNFT")
      expect(await nft.symbol()).to.equal("GNFT")

    })
    it("Should mint nft",async()=>{
      let {nft,addr1}=await loadFixture()
       await nft.connect(addr1).mint("Uri");
      expect( (await nft._tokenId()).toString()).to.equal("1")
      
        
    })
    it("Should emit event",async()=>{
      let {nft,addr1}=await loadFixture()
      await expect(nft.connect(addr1).mint("Nft")).to.emit(nft,"NftMinted")      
    })

  })
  describe("It should track the listing , selling and buying of nft",async()=>{
       it("Should emit listItem event",async()=>{
          let {nft, marketplace, deployer,addr1}=await loadFixture()
          await nft.connect(addr1).mint("Monkey");
          await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
          let listItem=await marketplace.connect(addr1).listItem(nft.address,1)
          await expect(listItem).to.emit(marketplace,"ItemListed")
          let item=await marketplace.Items(1);
          expect(item.tokenId).to.equal(1)
          expect(await nft.ownerOf(1)).to.equal(addr1.address)
          expect(item.price).to.equal(0)         

       })
       it("Should emit listForSell item event",async()=>{
        let {nft, marketplace, deployer,addr1}=await loadFixture()
        await nft.connect(addr1).mint("Monkey");
        await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        await marketplace.connect(addr1).listItem(nft.address,1)
        let sellItem=await marketplace.connect(addr1).listForSale(1,toWei(5));
        let item=await marketplace.Items(1);
        await expect(sellItem).to.emit(marketplace,"ItemListedForSale")
        let changePrice=await marketplace.connect(addr1).changeSellingPrice(1,toWei(6))
        await expect(changePrice).to.emit(marketplace,"ChangedSellingPrice")
        item=await marketplace.Items(1);
        expect(fromWei(item.price)).to.equal(6)
        expect(item.forSale).to.equal(true)
        
       })
       
       it("Should emit UnlistItemforsale event",async()=>{
        let {nft, marketplace, deployer,addr1,addr2}=await AnotherLoadFixture();
        await marketplace.connect(addr1).listForSale(1,toWei(5));
        let UnlistItemforsale=await marketplace.connect(addr1).unlistForSale(1);
        await expect(UnlistItemforsale).to.emit(marketplace,"ItemUnlistedForSale")

       })

       it("Should emit ItemSold event",async()=>{
        let {nft, marketplace, deployer,addr1,addr2}=await loadFixture()
        await nft.connect(addr1).mint("Monkey");
        await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        await marketplace.connect(addr1).listItem(nft.address,1)
        let sellItem=await marketplace.connect(addr1).listForSale(1,toWei(5));
        let buying=await marketplace.connect(addr2).buyItem(1, {value: toWei(5)});
        let item=await marketplace.Items(1);
        await expect(buying).to.emit(marketplace,"ItemSold")
        expect(item.owner).to.equal(addr2.address)
        expect(item.forSale).to.equal(false)
       })
       
       it ("Should emit moneyRefunded event durimg sale",async()=>{
         let{nft, marketplace, addr1,addr2,item}=await AnotherLoadFixture();
         await marketplace.connect(addr1).listForSale(1,toWei(5));
         let buying=await marketplace.connect(addr2).buyItem(1, {value: toWei(10)});
         await expect(buying).to.emit(marketplace,"moneyRefunded")
       })

       it("should emit burn nft events",async()=>{
        let{nft, marketplace, addr1,addr2,item}=await AnotherLoadFixture();
        let marketplaceBurn=await marketplace.connect(addr1).burnNft(1);
        let nftBurn=await nft.connect(addr1).burn(1);
        await expect(marketplaceBurn).to.emit(marketplace,"itemUnlisted");
        await expect(nftBurn).to.emit(nft,"NftBurnt")
       })

  })
  describe("It should track the lending of nft",async()=>{
     it("Should emit the listingForLendind event",async()=>{
      let {nft,marketplace,addr1,addr2,item}=await AnotherLoadFixture()
      let lend=await marketplace.connect(addr1).listForLend(1,5,4,10000);
      await expect(lend).to.emit(marketplace,"ItemListedForLend")

     })
     it("should emit unlist nft for lend event",async()=>{
      let {nft,marketplace,addr1,addr2,item}=await AnotherLoadFixture()
      let lend=marketplace.connect(addr1).listForLend(1,4,4,10000);
      let unlist=marketplace.connect(addr1).unlistForLend(1);
      await expect(unlist).to.emit(marketplace,"ItemUnlistedForLend")
     })
     it("Should emit changed lending parameters event",async()=>{
      let {nft,marketplace,addr1,addr2,item}=await AnotherLoadFixture()
      let lend=marketplace.connect(addr1).listForLend(1,4,4,10000);
      let changedParameters=await marketplace.connect(addr1).ChangeLendingParameters(1,1,1,10000);
      await expect(changedParameters).to.emit(marketplace,"ChangedLendingParameters");

     })
     it("Shold emit offer event and refund event",async()=>{
      let {nft,marketplace,addr1,addr2,item}=await AnotherLoadFixture()
      await marketplace.connect(addr1).listForLend(1,toWei(5),4,10000);
      let offer=await marketplace.connect(addr2).TakeOffer(1,{value: toWei(10)})
      await expect(offer).to.emit(marketplace,"LendOffer")
      await expect(offer).to.emit(marketplace,"moneyRefunded")
      
     })
     it('Should emit repayment event', async()=>{
           let {nft,marketplace,addr1,addr2,item}=await AnotherLoadFixture()
           await marketplace.connect(addr1).listForLend(1,toWei(10),4,10000);
           await marketplace.connect(addr2).TakeOffer(1,{value: toWei(10)})
           let repay=await marketplace.connect(addr1).moneyRepayment(1,{value: toWei(5)});
           await expect(repay).to.emit(marketplace,"MoneyRepayment")

     })
     it ("Should ask for nft",async()=>{
      let {nft,marketplace,addr1,addr2,item}=await AnotherLoadFixture()
      await marketplace.connect(addr1).listForLend(1,toWei(10),4,1);
      await marketplace.connect(addr2).TakeOffer(1,{value: toWei(10)})
        
         let askNft=await marketplace.connect(addr2).NftAsk(1);
        //  await expect(askNft).to.be.revertedWith('Time is left for the rebate')
         
       
     })
  })
 
})