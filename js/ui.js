/**
 * UI Module
 * Handles all UI rendering and interactions
 */

class UI {
    constructor() {
        this.selectedProblems = new Set();
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.classList.remove('hidden');

        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }

    /**
     * Show/hide loading indicator
     */
    setLoading(isLoading) {
        const loadingEl = document.getElementById('loadingIndicator');
        if (isLoading) {
            loadingEl.classList.remove('hidden');
        } else {
            loadingEl.classList.add('hidden');
        }
    }

    /**
     * Update statistics
     */
    updateStats(stats) {
        document.getElementById('totalProblems').textContent = stats.total || 0;
        document.getElementById('uniqueRatings').textContent = stats.ratings || 0;
        document.getElementById('handlesCount').textContent = stats.handles || 0;
        document.getElementById('selectedCount').textContent = this.selectedProblems.size;

        const statsSection = document.getElementById('statsSection');
        statsSection.classList.remove('hidden');
    }

    /**
     * Render filters section
     */
    renderFilters(problems) {
        const filtersSection = document.getElementById('filtersSection');
        const tagFilter = document.getElementById('tagFilter');

        // Get unique tags
        const tags = new Set();
        problems.forEach(p => p.tags.forEach(t => tags.add(t)));

        // Populate tag filter
        tagFilter.innerHTML = '<option value="">All Tags</option>';
        Array.from(tags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        filtersSection.classList.remove('hidden');
    }

    /**
     * Group problems by rating
     */
    groupProblemsByRating(problems) {
        const grouped = new Map();

        problems.forEach(problem => {
            const rating = problem.rating || 0;
            if (!grouped.has(rating)) {
                grouped.set(rating, []);
            }
            grouped.get(rating).push(problem);
        });

        return grouped;
    }

    /**
     * Render problems list
     */
    renderProblems(problems) {
        const problemsList = document.getElementById('problemsList');
        const resultsSection = document.getElementById('resultsSection');

        if (problems.length === 0) {
            problemsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No problems found matching your criteria.</p>';
            resultsSection.classList.remove('hidden');
            return;
        }

        const grouped = this.groupProblemsByRating(problems);
        const sortedRatings = Array.from(grouped.keys()).sort((a, b) => a - b);

        let html = '';

        sortedRatings.forEach(rating => {
            const ratingProblems = grouped.get(rating);
            const ratingClass = `rating-${rating}`;

            html += `
                <div class="rating-group" data-rating="${rating}">
                    <div class="rating-header">
                        <div class="rating-info">
                            <span class="rating-badge ${ratingClass}">${rating || 'Unrated'}</span>
                            <span class="rating-count">${ratingProblems.length} problem${ratingProblems.length !== 1 ? 's' : ''}</span>
                        </div>
                        <span class="expand-icon">▼</span>
                    </div>
                    <div class="problems-container">
                        ${ratingProblems.map(problem => this.renderProblemCard(problem)).join('')}
                    </div>
                </div>
            `;
        });

        problemsList.innerHTML = html;
        resultsSection.classList.remove('hidden');

        // Add event listeners for expanding/collapsing
        document.querySelectorAll('.rating-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const group = e.currentTarget.closest('.rating-group');
                group.classList.toggle('expanded');
            });
        });

        // Add event listeners for problem selection
        document.querySelectorAll('.problem-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                this.toggleProblemSelection(card.dataset.problemId);
            });
        });

        // Expand first group by default
        const firstGroup = problemsList.querySelector('.rating-group');
        if (firstGroup) {
            firstGroup.classList.add('expanded');
        }
    }

    /**
     * Render a single problem card
     */
    renderProblemCard(problem) {
        const problemId = `${problem.contestId}-${problem.index}`;
        const isSelected = this.selectedProblems.has(problemId);
        const problemUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;

        return `
            <div class="problem-card ${isSelected ? 'selected' : ''}" data-problem-id="${problemId}">
                <div class="problem-header">
                    <div class="problem-title">
                        <div class="problem-name">${this.escapeHtml(problem.name)}</div>
                        <div class="problem-id">${problem.contestId}${problem.index}</div>
                    </div>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} />
                    </div>
                </div>
                <div class="problem-stats">
                    <div class="stat-badge">
                        <span class="stat-icon">✅</span>
                        <span>${problem.solvedCount.toLocaleString()} solves</span>
                    </div>
                    <a href="${problemUrl}" target="_blank" class="problem-link" onclick="event.stopPropagation()">
                        View Problem →
                    </a>
                </div>
                ${problem.tags.length > 0 ? `
                    <div class="problem-tags">
                        ${problem.tags.slice(0, 5).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Toggle problem selection
     */
    toggleProblemSelection(problemId) {
        if (this.selectedProblems.has(problemId)) {
            this.selectedProblems.delete(problemId);
        } else {
            this.selectedProblems.add(problemId);
        }

        document.getElementById('selectedCount').textContent = this.selectedProblems.size;

        const card = document.querySelector(`[data-problem-id="${problemId}"]`);
        card.classList.toggle('selected');
    }

    /**
     * Select all problems
     */
    selectAllProblems(problems) {
        this.selectedProblems.clear();
        problems.forEach(problem => {
            const problemId = `${problem.contestId}-${problem.index}`;
            this.selectedProblems.add(problemId);
        });

        document.querySelectorAll('.problem-card').forEach(card => {
            card.classList.add('selected');
            card.querySelector('input[type="checkbox"]').checked = true;
        });

        document.getElementById('selectedCount').textContent = this.selectedProblems.size;
        this.showStatus(`Selected ${this.selectedProblems.size} problems`, 'success');
    }

    /**
     * Clear all selections
     */
    clearSelection() {
        this.selectedProblems.clear();
        document.querySelectorAll('.problem-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('input[type="checkbox"]').checked = false;
        });
        document.getElementById('selectedCount').textContent = 0;
    }

    /**
     * Render modal
     */
    renderModal(title, content, footer = '') {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = modalHtml;

        // Add event listeners
        const overlay = container.querySelector('.modal-overlay');
        const closeBtn = container.querySelector('.modal-close');

        const closeModal = () => {
            container.innerHTML = '';
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        closeBtn.addEventListener('click', closeModal);

        return closeModal;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default UI;
