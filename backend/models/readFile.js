const readFile = {
    /**
     * Read a file and turn it into a json structure.
     * @param {e} e 
     * @returns 
     */
    readFile: function(e) {
        var text = e.target.result;
        var lines = text.split("\n");
        lines[0] = lines[0].replace(/\r/g, "");
        var result = {};
        var blogList = [];
        var wordCount = [];
        var wordList = lines[0].split("\t");
        
        // throw away first header in header row which contains the word blog
        wordList.shift();

        // loop through each line in file and split the line where there is a tab.
        for (var i = 1; i < lines.length; i++) {
            if (lines[i].length > 0) {
                var obj = {};
                lines[i] = lines[i].replace(/\r/g, "");
                var currentLine = lines[i].split("\t");
                blogList[i-1] = currentLine[0];
                currentLine.shift();
                // convert wordCount to int
                var countArr = currentLine.map(v => parseInt(v, 10));
                wordCount[i-1] = countArr;
            }
        }

        //var res = wordCount.map(v => parseInt(v, 10));

        result = {"wordList": wordList, "blogList": blogList, "wordCount": wordCount};
        // console.log(headers.length);
        // console.log(blogList.length);

        // console.log(wordCount[4]);
        // console.log(wordCount[4][6]);
        // console.log(wordCount[5][6]);

        return result;
    }
};

module.exports = readFile;