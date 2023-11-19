import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const mintZeroNft: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const deployer = (await hre.ethers.getSigners())[0];

  const HarbergerNFT = await hre.ethers.getContract("HarbergerNft", deployer);
  try {
    const tx = await HarbergerNFT.connect(deployer).mintHarberger(1, 2, {
      value: BigNumber.from(await HarbergerNFT.calculateMintPrice()).add(123),
    });
    await tx.wait();
  } catch (e) {
    console.log(e);
  }

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default mintZeroNft;
