/**
 * Codeforces API Module
 * Handles all interactions with the Codeforces API
 */

const CF_API_BASE = 'https://codeforces.com/api';

class CodeforcesAPI {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get all problems from Codeforces
     */
    async getAllProblems() {
        const cacheKey = 'all_problems';
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${CF_API_BASE}/problemset.problems`);
            const data = await response.json();

            if (data.status !== 'OK') {
                throw new Error('Failed to fetch problems');
            }

            const problems = data.result.problems.map(problem => ({
                contestId: problem.contestId,
                index: problem.index,
                name: problem.name,
                type: problem.type,
                rating: problem.rating || 0,
                tags: problem.tags || [],
                solvedCount: 0
            }));

            // Get problem statistics
            const statistics = data.result.problemStatistics;
            const statsMap = new Map();
            statistics.forEach(stat => {
                const key = `${stat.contestId}-${stat.index}`;
                statsMap.set(key, stat.solvedCount);
            });

            // Add solved count to problems
            problems.forEach(problem => {
                const key = `${problem.contestId}-${problem.index}`;
                problem.solvedCount = statsMap.get(key) || 0;
            });

            this.cache.set(cacheKey, problems);
            return problems;
        } catch (error) {
            console.error('Error fetching problems:', error);
            throw error;
        }
    }

    /**
     * Get user submissions
     */
    async getUserSubmissions(handle) {
        const cacheKey = `submissions_${handle}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${CF_API_BASE}/user.status?handle=${handle}`);
            const data = await response.json();

            if (data.status !== 'OK') {
                throw new Error(`Failed to fetch submissions for ${handle}`);
            }

            const solvedProblems = new Set();
            data.result.forEach(submission => {
                if (submission.verdict === 'OK' && submission.problem) {
                    const key = `${submission.problem.contestId}-${submission.problem.index}`;
                    solvedProblems.add(key);
                }
            });

            this.cache.set(cacheKey, solvedProblems);
            return solvedProblems;
        } catch (error) {
            console.error(`Error fetching submissions for ${handle}:`, error);
            throw error;
        }
    }

    /**
     * Get unsolved problems for a list of handles
     */
    async getUnsolvedProblems(handles) {
        try {
            // Fetch all problems
            const allProblems = await this.getAllProblems();

            // Fetch submissions for all handles
            const solvedSets = await Promise.all(
                handles.map(handle => this.getUserSubmissions(handle))
            );

            // Filter problems that are unsolved by ALL handles
            const unsolvedProblems = allProblems.filter(problem => {
                const problemKey = `${problem.contestId}-${problem.index}`;
                return solvedSets.every(solvedSet => !solvedSet.has(problemKey));
            });

            // Sort by rating (ascending), then by solved count (descending)
            unsolvedProblems.sort((a, b) => {
                if (a.rating !== b.rating) {
                    return a.rating - b.rating;
                }
                return b.solvedCount - a.solvedCount;
            });

            return unsolvedProblems;
        } catch (error) {
            console.error('Error getting unsolved problems:', error);
            throw error;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

export default CodeforcesAPI;
