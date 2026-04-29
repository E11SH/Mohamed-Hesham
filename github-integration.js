const GitHubPortfolio = {
    username: 'E11SH',
    apiUrl: 'https://api.github.com',
    cacheKey: 'github_repos_cache',
    cacheExpiry: 3600000, // 1 hour in milliseconds

    // Repositories to exclude from display
    excludeRepos: ['Mohamed-Hesham'], // Portfolio repo itself

    // Forked repos - set to true to include them
    includeForks: true,

    // Custom descriptions for specific projects
    customDescriptions: {
        'Intrusion-Detection-System': 'Modeled network threat detection as a real-time classification problem, categorizing traffic into attack types (port scanning, DoS, ARP spoofing) using severity-based decision logic. Built a live monitoring dashboard with instant threat alerts, aggregated attack statistics, and interactive traffic visualization.',
        'RENTHUB': 'Full-stack property rental management platform with modern UI/UX design. Features comprehensive property listings, user authentication, advanced search functionality, and interactive dashboards for both property owners and renters to manage their rental activities.',
        'Kidney-Chronic-Disease': 'Comprehensive ML system for predicting chronic kidney disease using multiple classification models including Random Forest, SVM, and KNN. Features a full-stack web application with researcher mode for data analysis and patient predictions, built with Flask backend and responsive frontend.',
        'Studify': 'Architected the core AI intelligence layer using N8N automation workflows, transforming unstructured student queries into personalized, contextually relevant learning content. Built adaptive processing pipelines connecting multiple AI APIs and NLP services for real-time query understanding, content retrieval, and response generation at scale.',
        'Facial-Recognition': 'Advanced computer vision system for face detection and recognition using deep learning techniques. Implements facial feature extraction, face matching algorithms, and real-time recognition capabilities for security and authentication applications.',
        'Colon-Cancer-Detection': 'Automated cancer detection from histopathological images using Vision Transformers (ViT) for multi-class classification. Designing a multimodal architecture fusing structured clinical data with imaging features, with LLM-based treatment planning via RAG for evidence-grounded clinical recommendations. [In Progress]'
    },

    // Custom tech tags for specific projects
    customTechTags: {
        'Intrusion-Detection-System': ['Python', 'Scapy', 'Flask', 'HTML/CSS/JS', 'Network Security'],
        'RENTHUB': ['JavaScript', 'HTML/CSS', 'Node.js', 'Express', 'MongoDB'],
        'Kidney-Chronic-Disease': ['Python', 'Scikit-learn', 'Random Forest', 'SVM', 'KNN', 'Flask'],
        'Studify': ['HTML/CSS/JS', 'Node.js', 'Express', 'n8n', 'AI Integration', 'MySQL'],
        'Facial-Recognition': ['Python', 'OpenCV', 'Deep Learning', 'Computer Vision', 'Face Detection'],
        'Colon-Cancer-Detection': ['Python', 'Vision Transformers', 'PyTorch', 'RAG', 'Medical Imaging'],
        'Student-Score-Prediction-Model': ['Python', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn'],
        'Traffic-Sign-Recognition': ['Python', 'CNN', 'TensorFlow', 'OpenCV', 'Keras'],
        'Movie-Recommendation-System-Description': ['Python', 'Pandas', 'Scikit-learn', 'SVD', 'Collaborative Filtering'],
        'Loan-Approval-Prediction-Description': ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Scikit-learn'],
        'Customer-Segmentation': ['Python', 'K-Means', 'Pandas', 'Matplotlib', 'Seaborn']
    },

    /**
     * Initialize the GitHub integration
     */
    async init() {
        try {
            const repos = await this.fetchRepositories();
            if (repos && repos.length > 0) {
                this.displayProjects(repos);
                this.updateStatistics(repos);
            } else {
                console.log('Using static project content');
            }
        } catch (error) {
            console.error('GitHub API error:', error);
            console.log('Falling back to static content');
        }
    },

    /**
     * Fetch repositories from GitHub API with caching
     */
    async fetchRepositories() {
        // Check cache first
        const cached = this.getCache();
        if (cached) {
            console.log('Using cached GitHub data');
            return cached;
        }

        try {
            const response = await fetch(
                `${this.apiUrl}/users/${this.username}/repos?per_page=100&sort=updated`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const repos = await response.json();

            // Filter repositories
            const filteredRepos = repos.filter(repo => {
                // Exclude specific repos
                if (this.excludeRepos.includes(repo.name)) return false;

                // Exclude forks if configured
                if (!this.includeForks && repo.fork) return false;

                return true;
            });

            // Sort by updated date (most recent first)
            filteredRepos.sort((a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            );

            // Cache the results
            this.setCache(filteredRepos);

            return filteredRepos;
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return null;
        }
    },

    /**
     * Display projects in the portfolio
     */
    displayProjects(repos) {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) return;

        // Clear existing projects
        projectsGrid.innerHTML = '';

        // Create project cards
        repos.forEach(repo => {
            const card = this.createProjectCard(repo);
            projectsGrid.appendChild(card);
        });

        // Trigger animations
        this.triggerAnimations();
    },

    /**
     * Create a project card element
     */
    createProjectCard(repo) {
        const card = document.createElement('div');
        card.className = 'project-card';

        // Determine icon based on language or topics
        const icon = this.getProjectIcon(repo);

        // Get tech tags
        const techTags = this.getTechTags(repo);

        // Use custom description if available, otherwise use GitHub description
        const description = this.customDescriptions[repo.name] || repo.description || 'A project showcasing my development skills.';

        card.innerHTML = `
            <h3><i class="fas fa-${icon}"></i> ${repo.name.replace(/-/g, ' ')}</h3>
            <p style="color: var(--text-muted); line-height: 1.8;">${description}</p>
            <div class="tech-tags">
                ${techTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
            <div class="project-links">
                <a href="${repo.html_url}" class="project-link" target="_blank">
                    <i class="fab fa-github"></i> GitHub
                </a>
                ${repo.homepage ? `
                    <a href="${repo.homepage}" class="project-link" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                ` : ''}
            </div>
            ${repo.stargazers_count > 0 ? `
                <div style="margin-top: 1rem; color: var(--text-muted); font-size: 0.85rem;">
                    <i class="fas fa-star" style="color: var(--glow-blue);"></i> ${repo.stargazers_count} stars
                    ${repo.forks_count > 0 ? `<i class="fas fa-code-branch" style="margin-left: 1rem; color: var(--glow-blue);"></i> ${repo.forks_count} forks` : ''}
                </div>
            ` : ''}
        `;

        return card;
    },

    /**
     * Get appropriate icon for project
     */
    getProjectIcon(repo) {
        const name = repo.name.toLowerCase();
        const language = (repo.language || '').toLowerCase();
        const topics = repo.topics || [];

        // Check topics first
        if (topics.includes('machine-learning') || topics.includes('ml')) return 'brain';
        if (topics.includes('deep-learning') || topics.includes('neural-network')) return 'brain';
        if (topics.includes('web') || topics.includes('website')) return 'globe';
        if (topics.includes('security') || topics.includes('cybersecurity')) return 'shield-alt';
        if (topics.includes('data-science') || topics.includes('analytics')) return 'chart-bar';

        // Check by name keywords
        if (name.includes('colon') || name.includes('cancer')) return 'microscope';
        if (name.includes('kidney') || name.includes('disease') || name.includes('health')) return 'heartbeat';
        if (name.includes('traffic') || name.includes('sign') || name.includes('recognition')) return 'traffic-light';
        if (name.includes('movie') || name.includes('recommendation')) return 'film';
        if (name.includes('customer') || name.includes('segmentation')) return 'users';
        if (name.includes('intrusion') || name.includes('detection') || name.includes('security')) return 'shield-alt';
        if (name.includes('rent') || name.includes('hub') || name.includes('property')) return 'home';
        if (name.includes('loan') || name.includes('approval') || name.includes('prediction')) return 'chart-bar';
        if (name.includes('student') || name.includes('score') || name.includes('grade')) return 'brain';

        // Check by language
        if (language === 'python') return 'code';
        if (language === 'javascript') return 'code';
        if (language === 'jupyter notebook') return 'chart-line';

        return 'code'; // Default icon
    },

    /**
     * Get technology tags for project
     */
    getTechTags(repo) {
        // Use custom tech tags if available
        if (this.customTechTags[repo.name]) {
            return this.customTechTags[repo.name];
        }

        const tags = [];

        // Add primary language
        if (repo.language) {
            tags.push(repo.language);
        }

        // Add topics (GitHub topics are great for tech stack)
        if (repo.topics && repo.topics.length > 0) {
            // Capitalize and format topics
            const formattedTopics = repo.topics
                .slice(0, 4) // Limit to 4 additional tags
                .map(topic => {
                    // Common tech stack mappings
                    const mappings = {
                        'ml': 'Machine Learning',
                        'ai': 'AI',
                        'tensorflow': 'TensorFlow',
                        'pytorch': 'PyTorch',
                        'scikit-learn': 'Scikit-learn',
                        'nodejs': 'Node.js',
                        'reactjs': 'React',
                        'html-css-javascript': 'HTML/CSS/JS'
                    };

                    return mappings[topic.toLowerCase()] ||
                        topic.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ');
                });

            tags.push(...formattedTopics);
        }

        // If no topics, infer from name and description
        if (tags.length <= 1) {
            const name = repo.name.toLowerCase();
            const desc = (repo.description || '').toLowerCase();
            const text = name + ' ' + desc;

            if (text.includes('tensorflow')) tags.push('TensorFlow');
            if (text.includes('pytorch')) tags.push('PyTorch');
            if (text.includes('scikit') || text.includes('sklearn')) tags.push('Scikit-learn');
            if (text.includes('pandas')) tags.push('Pandas');
            if (text.includes('numpy')) tags.push('NumPy');
            if (text.includes('flask')) tags.push('Flask');
            if (text.includes('django')) tags.push('Django');
            if (text.includes('react')) tags.push('React');
            if (text.includes('node')) tags.push('Node.js');
            if (text.includes('express')) tags.push('Express');
            if (text.includes('mongodb')) tags.push('MongoDB');
            if (text.includes('mysql') || text.includes('sql')) tags.push('SQL');
        }

        // Limit to 5 tags total
        return tags.slice(0, 5);
    },

    /**
     * Update statistics based on repositories
     */
    updateStatistics(repos) {
        // Update project count
        const projectCountElement = document.querySelector('.stat-number[data-target]');
        if (projectCountElement) {
            projectCountElement.setAttribute('data-target', repos.length);
            projectCountElement.textContent = repos.length + '+';
        }

        // Count unique technologies
        const allTechs = new Set();
        repos.forEach(repo => {
            if (repo.language) allTechs.add(repo.language);
            if (repo.topics) repo.topics.forEach(topic => allTechs.add(topic));
        });

        const techElements = document.querySelectorAll('.stat-number[data-target]');
        if (techElements.length > 1) {
            techElements[1].setAttribute('data-target', allTechs.size);
            techElements[1].textContent = allTechs.size + '+';
        }
    },

    /**
     * Trigger animations for new elements
     */
    triggerAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.project-card').forEach(card => {
            observer.observe(card);
        });
    },

    /**
     * Cache management
     */
    getCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is expired
            if (now - timestamp > this.cacheExpiry) {
                localStorage.removeItem(this.cacheKey);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    },

    setCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    },

    /**
     * Clear cache manually
     */
    clearCache() {
        localStorage.removeItem(this.cacheKey);
        console.log('GitHub cache cleared');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GitHubPortfolio.init());
} else {
    GitHubPortfolio.init();
}

// Expose to window for manual control
window.GitHubPortfolio = GitHubPortfolio;
