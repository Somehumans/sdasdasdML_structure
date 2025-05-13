document.addEventListener('DOMContentLoaded', function() {
    // Create particle effect
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 120; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        const size = Math.random() * 8 + 4; // Slightly larger size for stars
        
        particle.classList.add('star'); // Add star class instead of inline styles
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random twinkle animation
        const duration = Math.random() * 3 + 2;
        particle.style.animation = `float ${duration}s linear infinite, twinkle ${duration * 0.5}s ease-in-out infinite`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Button click effect
    const playButton = document.getElementById('playButton');
    
    playButton.addEventListener('click', function() {
        playButton.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            playButton.style.transform = 'scale(1.05)';
            window.location.href = 'game.html';
        }, 100);
    });
});