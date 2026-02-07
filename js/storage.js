/**
 * Storage Module
 * Handles browser-based storage for groups using localStorage
 */

const STORAGE_KEY = 'cf_problem_finder_groups';

class Storage {
    constructor() {
        this.groups = this.loadGroups();
    }

    /**
     * Load all groups from localStorage
     */
    loadGroups() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading groups:', error);
            return [];
        }
    }

    /**
     * Save groups to localStorage
     */
    saveGroups() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.groups));
            return true;
        } catch (error) {
            console.error('Error saving groups:', error);
            return false;
        }
    }

    /**
     * Get all groups
     */
    getAllGroups() {
        return [...this.groups];
    }

    /**
     * Add a new group
     */
    addGroup(name, handles) {
        const group = {
            id: Date.now().toString(),
            name: name.trim(),
            handles: handles.map(h => h.trim()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.groups.push(group);
        this.saveGroups();
        return group;
    }

    /**
     * Get a group by ID
     */
    getGroup(id) {
        return this.groups.find(g => g.id === id);
    }

    /**
     * Update a group
     */
    updateGroup(id, name, handles) {
        const index = this.groups.findIndex(g => g.id === id);
        if (index !== -1) {
            this.groups[index].name = name.trim();
            this.groups[index].handles = handles.map(h => h.trim());
            this.groups[index].updatedAt = new Date().toISOString();
            this.saveGroups();
            return this.groups[index];
        }
        return null;
    }

    /**
     * Delete a group
     */
    deleteGroup(id) {
        const index = this.groups.findIndex(g => g.id === id);
        if (index !== -1) {
            this.groups.splice(index, 1);
            this.saveGroups();
            return true;
        }
        return false;
    }

    /**
     * Clear all groups
     */
    clearAll() {
        this.groups = [];
        localStorage.removeItem(STORAGE_KEY);
    }
}

export default Storage;
