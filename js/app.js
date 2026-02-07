/**
 * Main Application
 * Coordinates all modules and handles user interactions
 */

import CodeforcesAPI from './api.js';
import Storage from './storage.js';
import UI from './ui.js';
import Exporter from './exporter.js';

class App {
    constructor() {
        this.api = new CodeforcesAPI();
        this.storage = new Storage();
        this.ui = new UI();
        this.exporter = new Exporter();

        this.currentProblems = [];
        this.filteredProblems = [];
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.loadTheme();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Analyze button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeProblems();
        });

        // Save group button
        document.getElementById('saveGroupBtn').addEventListener('click', () => {
            this.showSaveGroupModal();
        });

        // Load group button
        document.getElementById('loadGroupBtn').addEventListener('click', () => {
            this.showLoadGroupModal();
        });

        // Filter buttons
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Select all button
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.ui.selectAllProblems(this.filteredProblems);
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportModal();
        });
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const body = document.body;
        const icon = document.querySelector('.theme-icon');
        
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            icon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            icon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-icon').textContent = '☀️';
        }
    }

    /**
     * Analyze problems
     */
    async analyzeProblems() {
        const handlesInput = document.getElementById('handlesInput').value.trim();
        
        if (!handlesInput) {
            this.ui.showStatus('Please enter at least one Codeforces handle', 'error');
            return;
        }

        const handles = handlesInput.split('\n')
            .map(h => h.trim())
            .filter(h => h.length > 0);

        if (handles.length === 0) {
            this.ui.showStatus('Please enter valid handles', 'error');
            return;
        }

        try {
            this.ui.setLoading(true);
            this.ui.showStatus('Fetching problems... This may take a moment', 'info');

            const problems = await this.api.getUnsolvedProblems(handles);

            this.currentProblems = problems;
            this.filteredProblems = problems;

            this.ui.setLoading(false);
            this.ui.showStatus(`Found ${problems.length} unsolved problems!`, 'success');

            // Update statistics
            const uniqueRatings = new Set(problems.map(p => p.rating)).size;
            this.ui.updateStats({
                total: problems.length,
                ratings: uniqueRatings,
                handles: handles.length
            });

            // Render filters and problems
            this.ui.renderFilters(problems);
            this.ui.renderProblems(problems);

        } catch (error) {
            this.ui.setLoading(false);
            this.ui.showStatus('Error fetching problems. Please check the handles and try again.', 'error');
            console.error(error);
        }
    }

    /**
     * Apply filters
     */
    applyFilters() {
        const minRating = parseInt(document.getElementById('minRating').value) || 0;
        const maxRating = parseInt(document.getElementById('maxRating').value) || 10000;
        const selectedTag = document.getElementById('tagFilter').value;
        const searchQuery = document.getElementById('searchQuery').value.toLowerCase().trim();

        this.filteredProblems = this.currentProblems.filter(problem => {
            // Rating filter
            const rating = problem.rating || 0;
            if (rating < minRating || rating > maxRating) {
                return false;
            }

            // Tag filter
            if (selectedTag && !problem.tags.includes(selectedTag)) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const problemId = `${problem.contestId}${problem.index}`.toLowerCase();
                const problemName = problem.name.toLowerCase();
                if (!problemId.includes(searchQuery) && !problemName.includes(searchQuery)) {
                    return false;
                }
            }

            return true;
        });

        this.ui.clearSelection();
        this.ui.renderProblems(this.filteredProblems);
        this.ui.showStatus(`Showing ${this.filteredProblems.length} problems`, 'info');

        // Update stats
        const uniqueRatings = new Set(this.filteredProblems.map(p => p.rating)).size;
        const handlesCount = parseInt(document.getElementById('handlesCount').textContent) || 0;
        this.ui.updateStats({
            total: this.filteredProblems.length,
            ratings: uniqueRatings,
            handles: handlesCount
        });
    }

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('minRating').value = '800';
        document.getElementById('maxRating').value = '3500';
        document.getElementById('tagFilter').value = '';
        document.getElementById('searchQuery').value = '';

        this.filteredProblems = this.currentProblems;
        this.ui.clearSelection();
        this.ui.renderProblems(this.filteredProblems);
        this.ui.showStatus('Filters reset', 'info');

        // Update stats
        const uniqueRatings = new Set(this.filteredProblems.map(p => p.rating)).size;
        const handlesCount = parseInt(document.getElementById('handlesCount').textContent) || 0;
        this.ui.updateStats({
            total: this.filteredProblems.length,
            ratings: uniqueRatings,
            handles: handlesCount
        });
    }

    /**
     * Show save group modal
     */
    showSaveGroupModal() {
        const handlesInput = document.getElementById('handlesInput').value.trim();
        
        if (!handlesInput) {
            this.ui.showStatus('Please enter handles before saving a group', 'error');
            return;
        }

        const handles = handlesInput.split('\n')
            .map(h => h.trim())
            .filter(h => h.length > 0);

        const content = `
            <div class="input-group">
                <label for="groupName">Group Name</label>
                <input type="text" id="groupName" placeholder="e.g., Team Alpha" autofocus />
            </div>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                Handles: ${handles.join(', ')}
            </p>
        `;

        const footer = `
            <button class="btn btn-secondary" id="cancelSave">Cancel</button>
            <button class="btn btn-primary" id="confirmSave">Save Group</button>
        `;

        const closeModal = this.ui.renderModal('Save Group', content, footer);

        document.getElementById('cancelSave').addEventListener('click', closeModal);
        document.getElementById('confirmSave').addEventListener('click', () => {
            const name = document.getElementById('groupName').value.trim();
            if (!name) {
                this.ui.showStatus('Please enter a group name', 'error');
                return;
            }

            this.storage.addGroup(name, handles);
            this.ui.showStatus(`Group "${name}" saved successfully!`, 'success');
            closeModal();
        });
    }

    /**
     * Show load group modal
     */
    showLoadGroupModal() {
        const groups = this.storage.getAllGroups();

        let content;
        if (groups.length === 0) {
            content = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No saved groups found</p>';
        } else {
            content = `
                <div class="group-list">
                    ${groups.map(group => `
                        <div class="group-item" data-group-id="${group.id}">
                            <div class="group-info">
                                <h3>${this.ui.escapeHtml(group.name)}</h3>
                                <div class="group-meta">
                                    ${group.handles.length} handle${group.handles.length !== 1 ? 's' : ''} • 
                                    Created ${new Date(group.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div class="group-actions">
                                <button class="icon-btn delete" data-action="delete" data-group-id="${group.id}" title="Delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const closeModal = this.ui.renderModal('Load Group', content);

        // Add event listeners for group items
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.icon-btn')) {
                    return;
                }

                const groupId = item.dataset.groupId;
                const group = this.storage.getGroup(groupId);
                if (group) {
                    document.getElementById('handlesInput').value = group.handles.join('\n');
                    this.ui.showStatus(`Loaded group "${group.name}"`, 'success');
                    closeModal();
                }
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupId = btn.dataset.groupId;
                const group = this.storage.getGroup(groupId);
                
                if (confirm(`Delete group "${group.name}"?`)) {
                    this.storage.deleteGroup(groupId);
                    this.ui.showStatus('Group deleted', 'success');
                    closeModal();
                    // Reopen modal with updated list
                    setTimeout(() => this.showLoadGroupModal(), 100);
                }
            });
        });
    }

    /**
     * Show export modal
     */
    showExportModal() {
        let problemsToExport;
        
        if (this.ui.selectedProblems.size > 0) {
            // Export selected problems
            problemsToExport = this.filteredProblems.filter(p => 
                this.ui.selectedProblems.has(`${p.contestId}-${p.index}`)
            );
        } else {
            // Export all filtered problems
            problemsToExport = this.filteredProblems;
        }

        if (problemsToExport.length === 0) {
            this.ui.showStatus('No problems to export', 'error');
            return;
        }

        const content = `
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                Exporting ${problemsToExport.length} problem${problemsToExport.length !== 1 ? 's' : ''}
            </p>
            <div class="export-options">
                <div class="export-option" data-format="vjudge">
                    <div class="export-icon">🏆</div>
                    <div class="export-title">Vjudge Format</div>
                    <div class="export-desc">Tab-separated format for Vjudge</div>
                </div>
                <div class="export-option" data-format="csv">
                    <div class="export-icon">📄</div>
                    <div class="export-title">CSV</div>
                    <div class="export-desc">Spreadsheet-compatible format</div>
                </div>
                <div class="export-option" data-format="json">
                    <div class="export-icon">📋</div>
                    <div class="export-title">JSON</div>
                    <div class="export-desc">Structured data format</div>
                </div>
            </div>
        `;

        const closeModal = this.ui.renderModal('Export Problems', content);

        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', () => {
                const format = option.dataset.format;
                this.exportProblems(format, problemsToExport);
                closeModal();
            });
        });
    }

    /**
     * Export problems
     */
    exportProblems(format, problems) {
        try {
            switch (format) {
                case 'csv':
                    this.exporter.exportAsCSV(problems);
                    break;
                case 'json':
                    this.exporter.exportAsJSON(problems);
                    break;
                case 'vjudge':
                    this.exporter.exportForVjudge(problems);
                    break;
            }
            this.ui.showStatus(`Exported ${problems.length} problems as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            this.ui.showStatus('Error exporting problems', 'error');
            console.error(error);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
