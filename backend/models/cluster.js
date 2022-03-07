const readFile = require('./readFile');

const cluster = {
    /**
     * Read in the blog text file, and call kMeansCluster on it.
     * @param {res} res 
     * @param {req} req 
     */
     kmeansClustering: function(res, req) {
        var path = require("path");
        var FileReader = require('filereader');
        var fapi = require ('file-api');
        
        var reader = new FileReader();
        var File = fapi.File;

        //var maxIterations = 5;
        var maxIterations = req.query.iterations;
        //console.log("maxIt " + maxIterations);
        console.time("kmeans time");
        
        reader.onload = function(e) {
            var result = readFile.readFile(e);
            var clusters = cluster.kMeansCluster(result.wordList, result.blogList, result.wordCount, maxIterations);
            console.timeEnd("kmeans time");
            //console.log(JSON.stringify(result));
            return res.status(200).send(JSON.stringify(clusters));
        }
        reader.readAsText(new File(req.app.locals.blogDB));

    },
    /**
     * Calculate the pearson score.
     * @param {blogA} blogA 
     * @param {blogB} blogB 
     * @returns the score 
     */
    pearson: function(blogA, blogB, n) {
        // Init variables
        var sumA = 0;
        var sumB = 0;
        var sumAsq = 0;
        var sumBsq = 0;
        var pSum = 0;
        var num = 0.0;
        var den = 0.0;
        
        // Iterate over all words
        for (var i = 0; i < n; i++) {
            var cntA = blogA[i]; // word counts for each word in A
            var cntB = blogB[i]; // word counts for each word in B
            
            sumA += cntA; // sum of word counts for A
            sumB += cntB; // sum of word counts for B
            sumAsq += cntA**2;  // sum of squared word counts for A
            sumBsq += cntB**2;  // sum of squared word counts for B
            pSum +=  cntA * cntB; // product of word counts from A and B
        }
        // Calculate Pearson
        num = pSum - (sumA * sumB / n);
        den = Math.sqrt((sumAsq - sumA**2 / n) * (sumBsq - sumB**2 / n));
        // Return inverted Pearson score
        return 1.0 - num / den;
    },
    /**
     * Get the minimum and maximum value from wordCount.
     * @param {wordCount} wordCount 
     * @returns the min and max value
     */
    getMinMaxCounts(wordCount) {
        var minMaxCount = [];
        var n = wordCount[0].length;
        //console.log(wordCount[0][0]);

        for (var j = 0; j < n; j++) {
            var minCount = Number.MAX_SAFE_INTEGER; 
            var maxCount = 0;
            for (var i = 0; i < wordCount.length; i++) {
                // Set the new highest value
                //console.log("i " + i + "    " + "j " + j);
                if (wordCount[i][j] > maxCount) {
                    maxCount = wordCount[i][j];
                }
                // Set the new lowest value
                if (wordCount[i][j] < minCount) {
                    minCount = wordCount[i][j];
                }
            }
            minMaxCount[j] = {"max": maxCount, "min": minCount};
        }
        return minMaxCount;
    },
    /**
     * Clear the assignments by declaring an empty array.
     * @param {assignments} assignments 
     * @returns the assignments
     */
    clearAssignments: function(assignments) {
        assignments = [];

        return assignments;
    },
    /**
     * Pushes the best centroid for a blog into assignments.
     * @param {assignments} assignments 
     * @param {centroidIndex} centroidIndex 
     * @param {blogIndex} blogIndex 
     * @returns the assignments
     */
    assignBestCentroid: function(assignments, centroidIndex, blogIndex) {
        if (assignments[centroidIndex] == null) {
            assignments[centroidIndex] = new Array();
        }
        assignments[centroidIndex].push(blogIndex);
        //console.log("assigning blog: " + blogIndex + " to centroid " + centroidIndex);
        return assignments;
    },
    /**
     * Calculates the kmeans clustera algorithm.
     * @param {wordList} wordList 
     * @param {blogList} blogList 
     * @param {wordCount} wordCount 
     * @param {maxIterations} maxIterations 
     * @returns the cluster
     */
    kMeansCluster: function(wordList, blogList, wordCount, maxIterations) {
        //Number of words
        var n = wordList.length; // 706
        // Generate K random centroids
        var k = 5; 
        var centroids = [];
        var assignments = [];
        var wordMinMaxCount = cluster.getMinMaxCounts(wordCount);
        var blogAssignments = []; // indexed on blog id, gives value of cluster id
        var blogAssignmentChanged = false;
        var iterateAgain = true;
        var iterationCount = 0;
        //console.log(wordMinMaxCount);

        // set previous blog assignment to invalid value
        for (var i = 0; i < blogList.length; i++) {
            blogAssignments[i] = -1;
        }

        // intialize the centroids
        for (var i = 0; i < k; i++) {
            c = new Array();
            // iterate through each word
            for (var j = 0; j < n; j++) {
                // set the initial word count for word j for this cluster to a random number between the highest and lowest value.
                var temp = Math.floor(Math.random() * (wordMinMaxCount[j].max - wordMinMaxCount[j].min)) + wordMinMaxCount[j].min;
                c[j] = temp;
                //console.log(temp);
                //console.log("max " + wordMinMaxCount[j].max + "      min " + wordMinMaxCount[j].min + "     temp " + temp);
            }
            centroids[i] = c;
        }
        //console.log(centroids);
        // Iteration loop, 
        for (var i = 0; iterateAgain == true; i++) {
            blogAssignmentChanged = false;
            // Clear assignments for all centroids
            assignments = cluster.clearAssignments(assignments);
        
            // Assign each blog to closest centroid
            for (var b = 0; b < blogList.length; b++) {
                var distance = Number.MAX_VALUE;
                var best; // int corresponding to the index of the centroid array
                
                // Find closest centroid
                for (var j = 0; j < centroids.length; j++) {
                    var cDist = cluster.pearson(centroids[j], wordCount[b], n);
                    //console.log("cDist " + cDist);
                    if (cDist < distance) {
                        best = j;
                        //console.log("setting best to " + j);
                        distance = cDist;
                    }
                }
                // Assign blog to centroid
                assignments = cluster.assignBestCentroid(assignments, best, b);
               
                // check if previous blog assignment is not the same as the new best cluster
                if (blogAssignments[b] != best) {
                    // set blogAssignmentsChanged flag to true so another iteration will be required
                    blogAssignmentChanged = true;
                    // set the new best cluster for this blog
                    blogAssignments[b] = best;
                }
            }
            // Re-calculate center for each centroid
            for (var j = 0; j < centroids.length; j++) {
                for (var w = 0; w < n; w++) {
                    var sum = 0;
                    var avg = 0;
                    // Iterate over all blogs assigned to this centroid
                    for (var a = 0; a < assignments[j].length; a++) {
                        // adds the sum for each word in the blogs
                        sum += wordCount[assignments[j][a]] [w]; // j refers to cluster. a refers to a blog within cluster. ja refers to a blogId
                    }
                    avg = sum / assignments[j].length;
                    // Update word count for the centroid
                    centroids[j][w] = avg;
                }
            }
            iterationCount++;

            // (Grade C-D) terminate when no new assignments have been made
            if (maxIterations == -1) {
                // checking if new assignments have been made
                if (blogAssignmentChanged ==  true) {
                    // new assignments made, need to iterate the main loop again
                    iterateAgain = true;
                } else {
                    // no new assignments made, finish main loop
                    iterateAgain = false;
                }
            } else {
                // (Grade E) terminate on specified amount of iterations
                if (iterationCount < maxIterations) {
                    if (blogAssignmentChanged == true) {
                        // not reached max iterations, new assignments still made
                        iterateAgain = true;
                    } else {
                        // no new assignments made, but stil less than specified amount of iterations, terminate anyway
                        iterateAgain = false;
                    }
                } else {
                    // terminate because max iterations reach
                    iterateAgain = false;
                }
            }
            //output for showing assignments on each iterations
            var outputStr = "";
            for (var z = 0; z < blogList.length; z++) {
                outputStr += blogAssignments[z] + " ";
            }
            console.log(outputStr);
        }
        // End of iteration loop – all done
        var clusters = [];
        //console.log(assignments);
        // create an array of arrays, containing blog names in each cluster
        // iterate through the assignments for each cluster
        for (var i = 0; i < assignments.length; i++) {
            clusters[i] = new Array();
            // check that the cluster contains blogs
            if (assignments[i] != null) {
                // iterate through each blog assigned to this cluster
                for (var j = 0; j < assignments[i].length; j++) {
                    // push the blog name 
                    clusters[i].push(blogList[assignments[i][j]]);
                }
            }
        }
        //console.log(clusters);
        console.log("iterationCount = " + iterationCount);
        return clusters;
    }
};

module.exports = cluster;

