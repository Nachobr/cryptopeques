async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account:', deployer.address);

    const Escrow = await ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy(); // No need to pass arguments here
    await escrow.deployed();

    console.log('Escrow contract deployed to:', escrow.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
