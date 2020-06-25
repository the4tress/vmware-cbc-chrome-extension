// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

var i = 0;

function test() {
	setTimeout(function() {
		i++;
		chrome.browserAction.setBadgeText({text: i.toString() });
		test();
	}, 1000);
}

// test();
