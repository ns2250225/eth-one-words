var BlogSystem = artifacts.require('./BlogSystem');

module.exports = (deployer) => {
    deployer.deploy(BlogSystem);
}