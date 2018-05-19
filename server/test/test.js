var bayes = require('bayes')
var classifier = bayes({
    tokenizer: function (text) { return text.split(' ') }
})
const fs = require('fs');
const article = fs.readFileSync("C:/test/test.txt");
lineArray = article.toString();
line = lineArray.split('\r\n');

for(var i in line){
    //console.log(line[i]);
    var s = line[i].split(", ");
    //bf.fit(s[0], s[1]);
    classifier.learn(s[0], s[1]);
}
console.log(classifier.categorize("주희좀 채팅방에 초대해줘"));
