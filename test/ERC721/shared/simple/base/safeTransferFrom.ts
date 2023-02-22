import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

import { deployErc721NonReceiver, deployErc721Receiver } from "@gemunion/contracts-mocks";

import { templateId, tokenId } from "../../../../constants";

export function shouldSafeTransferFrom(factory: () => Promise<Contract>) {
  describe("safeTransferFrom", function () {
    it("should fail: not an owner", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = contractInstance
        .connect(receiver)
        ["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, tokenId);

      await expect(tx).to.be.revertedWith(`ERC721: caller is not token owner or approved`);
    });

    it("should transfer own tokens to receiver contract", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();
      const erc721ReceiverInstance = await deployErc721Receiver();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = contractInstance["safeTransferFrom(address,address,uint256)"](
        owner.address,
        erc721ReceiverInstance.address,
        tokenId,
      );

      await expect(tx)
        .to.emit(contractInstance, "Transfer")
        .withArgs(owner.address, erc721ReceiverInstance.address, tokenId);

      const balanceOfOwner = await contractInstance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(0);

      const balanceOfReceiver = await contractInstance.balanceOf(erc721ReceiverInstance.address);
      expect(balanceOfReceiver).to.equal(1);
    });

    it("should transfer own tokens to non receiver contract", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();
      const erc721NonReceiverInstance = await deployErc721NonReceiver();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = contractInstance["safeTransferFrom(address,address,uint256)"](
        owner.address,
        erc721NonReceiverInstance.address,
        tokenId,
      );
      await expect(tx).to.be.revertedWith(`ERC721: transfer to non ERC721Receiver implementer`);
    });

    it("should transfer approved tokens to receiver contract", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();
      const erc721ReceiverInstance = await deployErc721Receiver();

      await contractInstance.mintCommon(owner.address, templateId);
      await contractInstance.approve(receiver.address, tokenId);

      const tx = contractInstance
        .connect(receiver)
        ["safeTransferFrom(address,address,uint256)"](owner.address, erc721ReceiverInstance.address, tokenId);

      await expect(tx)
        .to.emit(contractInstance, "Transfer")
        .withArgs(owner.address, erc721ReceiverInstance.address, tokenId);

      const balanceOfOwner = await contractInstance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(0);

      const balanceOfReceiver = await contractInstance.balanceOf(erc721ReceiverInstance.address);
      expect(balanceOfReceiver).to.equal(1);
    });

    it("should transfer approved tokens to non receiver contract", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();
      const erc721NonReceiverInstance = await deployErc721NonReceiver();

      await contractInstance.mintCommon(owner.address, templateId);
      await contractInstance.approve(receiver.address, tokenId);

      const tx = contractInstance
        .connect(receiver)
        ["safeTransferFrom(address,address,uint256)"](owner.address, erc721NonReceiverInstance.address, tokenId);
      await expect(tx).to.be.revertedWith(`ERC721: transfer to non ERC721Receiver implementer`);
    });
  });
}
