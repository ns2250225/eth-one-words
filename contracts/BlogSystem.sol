pragma solidity ^0.4.4;

contract BlogSystem {

    // 每次阅读的奖励
    uint256 public readPrice = 0.001 ether;

    // 每次发布文章的价格
    uint256 public publishPrice = 0.001 ether;

    // 合约拥有者的地址
    address owner;

    // 发布文章事件
    event PublishArticle(address sender, string title);

    // 点赞文章事件
    event ReadArticle(address sender);

    // 存放每个作者的奖励，用于提现
    mapping (address => uint) pendingWithdrawals;

    // 存放address到title的映射
    mapping (address => string) titleOf;

    // 存放title到address的映射
    mapping (string => address) authorAddress;


    // 函数装饰器--合约拥有者权限
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    // 合约构造函数
    function BlogSystem() {
        owner = msg.sender;
    }

    // 发布文章函数
    function Publish(string _title) payable {
        require(msg.value >= publishPrice);

        // 存放文章与作者地址的映射
        authorAddress[_title] = msg.sender;
        titleOf[msg.sender] = _title;

        // 触发发布文章事件
        PublishArticle(msg.sender, _title);
    }

    // 点赞文章函数
    function Read(string _title) payable {
        require(msg.value >= readPrice);

        // 文章作者获得奖励
        address _author = authorAddress[_title];
        pendingWithdrawals[_author] += readPrice;

        // 触发文章点赞事件
        ReadArticle(msg.sender);
    }


    // 查看合约余额
    function contractBalance() constant returns(uint) {
        return this.balance;
    }


    // 提现奖励
    function withdraw() payable {
        uint amount = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    // 查看作者累计奖励
    function balanceOf(address user) constant returns(uint) {
        return pendingWithdrawals[user];
    }

    // 设置发布文章价格
    function setPublishPrice(uint _publishPrice) onlyOwner {
        publishPrice = _publishPrice;
    }

    // 设置阅读文章奖励
    function setReadPrice(uint _readPrice) onlyOwner {
        readPrice = _readPrice;
    }

}
