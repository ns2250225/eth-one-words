var web3Provider = null
var contracts = {}
var balance = 0
var account = null
var instance = null

$(function() {
  $(window).load(function() {
    init()
  })
})

// 初始化
function init() {
  console.log("init start...")

  // init web3
  if (typeof web3 !== 'undefined') {
      web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
  } else {
      // set the provider you want from Web3.providers
      web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
      web3 = new Web3(web3Provider)
      alert('You need MetaMask extension or Parity to use this app.')
  }

  // init contracts
  $.getJSON('BlogSystem.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var BlogSystemArtifact = data

      try {
         contracts.BlogSystem = TruffleContract(BlogSystemArtifact)

        // Set the provider for our contract.
        contracts.BlogSystem.setProvider(web3Provider)

        checkAccount()

      } catch(err) {
          console.log(err)
      }
  })

  // event binding
  $(document).on('click', '#publish', publish)
  $(document).on('click', '#whitdraw', whitdraw)

  console.log("init end...")
}


function checkAccount() {
  web3.eth.getAccounts(function(error, accounts) {
        account = accounts[0]

        contracts.BlogSystem.deployed().then(function(_instance) {
            instance = _instance

            // add event listen
            var publish_event = instance.PublishArticle()
            var read_event = instance.ReadArticle()
            publish_event.watch(function(err, resp) {
               if(resp.event === "PublishArticle") {
                  
                   var title = resp.args.title
                   
                   $("#ArticleList").append(`<div class='row' style='margin-left: 300px;'><h1 style='display: inline-block;'>${title}</h1><button type='button' onclick='read("${title}")' class='btn btn-primary' style='display: inline-block; margin-left:350px;'>点赞</button></div>`)
                   console.log(title)

                   alert('发布成功！')
               }
            });

            checkBalance()
        })
        .catch(function(err) {
            alert('Make sure you are connected to Ropsten network')
        })
    })
}


function checkBalance() {
  instance.balanceOf.call(account).then(function(_balance) {
        balance = _balance.valueOf()
        var balanceInEther = web3.fromWei(balance, "ether")
        $("#balance").html(balanceInEther + " ether")
  })
}

function whitdraw() {
  checkBalance()

  if(balance != 0) {
    instance.withdraw.sendTransaction({from: account, value: 0, gas: 3141592}).then(function(resp) {
        console.log(resp)
        alert("提现成功！")
        setTimeout(checkBalance, 2000)
    })
    .catch(function(err) {
        console.log(err)
    });
  } else {
    alert('你没有能提现的奖励')
  }
}


function publish() {
  var _title = $("#article-title").val()

  // sned transaction to publish an article
  instance.Publish.sendTransaction(_title, {from: account, value: web3.toWei('0.001', 'ether')}).then(function(resp) {
    console.log(resp)
    $("#cancel").click()
    setTimeout(checkBalance, 2000)
  })
  .catch(function(err) {
    console.log(err)
  })
}

function read(title) {
  console.log(title)
  // sned transaction to read an article
  instance.Read.sendTransaction(title, {from: account, value: web3.toWei('0.001', 'ether')}).then(function(resp) {
    console.log(resp)
    setTimeout(checkBalance, 2000)
  })
  .catch(function(err) {
    console.log(err)
  })
}