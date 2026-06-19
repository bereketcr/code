/**
 * ============================================================================
 * BEGINNER PORTFOLIO INTERACTIVITY SCRIPT (HEAVILY COMMENTED FOR LEARNERS)
 * ============================================================================
 * 
 * Welcome! This JavaScript file manages all the user interaction on the page.
 * It is written using plain (vanilla) JavaScript without external libraries, 
 * using simple functions and comments to explain how modern frontend logic works.
 * 
 * TABLE OF CONTENTS:
 * 1. DOMContentLoaded Event (Initial boot)
 * 2. Theme Management (Light / Dark Mode toggle & localStorage persistence)
 * 3. Mobile Navigation Menu Toggle (Responsive drawer & Accessibility support)
 * 4. ScrollSpy (Auto-highlighting the active navbar link on scroll)
 * 5. Contact Form Client-side Validation (Regular expressions & validation states)
 * 6. Back to Top Button (Smooth scrolling & window height observation)
 * 7. Dynamic Footer Copyright Year (Auto-updating copyright notice)
 */

// We wrap our entire code block in the DOMContentLoaded event listener.
// This ensures that our JavaScript runs ONLY after the browser has parsed
// the complete HTML document and built the DOM tree. If we ran it earlier,
// document.getElementById() would fail to find our HTML elements.
document.addEventListener('DOMContentLoaded', () => {

  /* =================================================================---------
     1. THEME MANAGEMENT (LIGHT / DARK MODE)
     ================================================================----------
     How this works:
     - We define our colors in style.css using CSS Custom Properties (Variables).
     - To change themes, we simply append or remove the ".dark-theme" class on the <body>.
     - We check system preferences first (prefers-color-scheme) as a smart default.
     - We store the preference in the browser's localStorage so it is remembered on reload.
  */
  
  // 1.1 Grab the theme switcher button element from the HTML
  const themeToggleBtn = document.getElementById('themeToggle');
  
  // 1.2 Helper function to apply the theme to the <body> element.
  // Adding the '.dark-theme' class triggers the variables defined under 'body.dark-theme' in style.css.
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  // 1.3 Read saved theme setting from the browser's storage
  const savedTheme = localStorage.getItem('theme');
  
  // 1.4 Check if the user's OS is configured to favor dark mode
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 1.5 Determine initial state:
  // - If the user has visited before and saved a preference, use that.
  // - Otherwise, check if their operating system defaults to dark mode.
  // - Default to light mode if neither is true.
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDark) {
    applyTheme('dark');
  }

  // 1.6 Listen for button clicks to toggle between themes.
  themeToggleBtn.addEventListener('click', () => {
    // If the body already has dark-theme, switch to light.
    if (document.body.classList.contains('dark-theme')) {
      applyTheme('light');
      localStorage.setItem('theme', 'light'); // Persist "light" setting
    } else {
      // If it doesn't have dark-theme, apply it.
      applyTheme('dark');
      localStorage.setItem('theme', 'dark');  // Persist "dark" setting
    }
  });


  /* =================================================================---------
     2. MOBILE NAVIGATION MENU TOGGLE
     ================================================================----------
     How this works:
     - On mobile screens, the menu navigation links are hidden by default.
     - Clicking the hamburger button appends the class '.mobile-open' to show them.
     - For accessibility, we toggle the 'aria-expanded' attribute. This lets screen
       readers know if the menu dropdown is currently open or shut.
  */
  
  // 2.1 Grab the mobile hamburger button, the menu container, and all link anchors
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // 2.2 Toggle open/close classes on click
  mobileMenuBtn.addEventListener('click', () => {
    // Check if the menu is open (returns true/false based on ARIA attribute value)
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    
    // Toggle active state classes for hamburger styling (draws the 'X' button shape)
    mobileMenuBtn.classList.toggle('active');
    
    // Toggle class that reveals the navigation menu items
    navMenu.classList.toggle('mobile-open');
    
    // Toggle the aria-expanded state for assistive tech compatibility
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
  });

  // 2.3 Close mobile menu automatically when a navigation link is clicked.
  // If we don't do this, clicking an anchor link will scroll to the section
  // but leave the mobile menu dropdown covering the viewport.
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // If the mobile menu drawer is currently visible, close it
      if (navMenu.classList.contains('mobile-open')) {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('mobile-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });


  /* =================================================================---------
     3. ACTIVE NAVIGATION HIGHLIGHTING ON SCROLL (SCROLLSPY)
     ================================================================----------
     How this works:
     - As the user scrolls, we check which page section is currently on screen.
     - We calculate the current scroll depth and cross-reference it with the
       top boundary of each section on the page.
     - Once we identify the visible section, we add the '.active' class to its
       respective link in the navbar, and remove it from all others.
  */
  
  // 3.1 Get a list of all <section> elements on the page
  const sections = document.querySelectorAll('section');
  
  // 3.2 Update active status handler function
  const highlightActiveSection = () => {
    let currentSectionId = 'hero'; // Fallback starting section ID
    const scrollPosition = window.scrollY; // Number of pixels scrolled vertically
    
    sections.forEach(section => {
      // Calculate top position of the section relative to the page top.
      // We subtract 120 pixels to offset the sticky header height, so that
      // the link highlights right as the section header comes into view.
      const sectionTop = section.offsetTop - 120;
      
      // Calculate height of the current section
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute('id');
      
      // If our current scroll position lies within the boundaries of this section
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = sectionId;
      }
    });

    // 3.3 Apply '.active' styling to the corresponding navbar link
    navLinks.forEach(link => {
      link.classList.remove('active'); // Clear active styling on all links
      const href = link.getAttribute('href');
      
      // If the link target matches the section ID in view, highlight it
      if (href === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  // 3.4 Listen for scroll events on the window, and trigger the check on page load
  window.addEventListener('scroll', highlightActiveSection);
  highlightActiveSection();


  /* =================================================================---------
     4. CONTACT FORM CLIENT-SIDE VALIDATION
     ================================================================----------
     How this works:
     - When the user tries to submit the contact form, we intercept the event.
     - We check if fields are empty and validate the email syntax with regex.
     - If errors exist, we block the submission and apply '.invalid' state classes
       to display the hidden warning text in the DOM.
     - We clear errors in real-time as the user types using 'input' event listeners.
  */
  
  // 4.1 Gather form elements
  const contactForm = document.getElementById('contactForm');
  const formName = document.getElementById('formName');
  const formEmail = document.getElementById('formEmail');
  const formMessage = document.getElementById('formMessage');
  const formSuccess = document.getElementById('formSuccess');

  // 4.2 Helper function for email string validation using a Regular Expression (regex).
  // This verifies that the input format matches "username@domain.extension".
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 4.3 Validation utility function: Toggles the '.invalid' class on the form-group.
  // If condition is met, validation passes. Otherwise, it fails.
  const validateField = (inputElement, errorElementId, validationCondition) => {
    const formGroup = inputElement.parentElement; // The surrounding container
    
    if (validationCondition) {
      formGroup.classList.remove('invalid'); // Clear red border & error message
      return true;
    } else {
      formGroup.classList.add('invalid');    // Show red border & error message
      return false;
    }
  };

  // 4.4 Real-time input validation listener: Clears errors as the user writes.
  // This improves the user experience by immediately clearing error styling once
  // the field requirements are met.
  formName.addEventListener('input', () => {
    validateField(formName, 'nameError', formName.value.trim() !== '');
  });

  formEmail.addEventListener('input', () => {
    validateField(formEmail, 'emailError', isValidEmail(formEmail.value.trim()));
  });

  formMessage.addEventListener('input', () => {
    validateField(formMessage, 'messageError', formMessage.value.trim() !== '');
  });

  // 4.5 Capture Form Submission Event
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevents the page from refreshing on submit

    // Perform validation checks on all fields
    const isNameValid = validateField(formName, 'nameError', formName.value.trim() !== '');
    const isEmailValid = validateField(formEmail, 'emailError', isValidEmail(formEmail.value.trim()));
    const isMessageValid = validateField(formMessage, 'messageError', formMessage.value.trim() !== '');

    // 4.6 If all fields pass validation checks, process submission
    if (isNameValid && isEmailValid && isMessageValid) {
      // Real developer applications send this data to a backend server.
      // For this frontend mockup, we simulate a successful mock API call.
      console.log('Sending message:', {
        name: formName.value,
        email: formEmail.value,
        message: formMessage.value
      });

      // Show the success message banner on screen
      formSuccess.style.display = 'block';
      
      // Clear form inputs
      contactForm.reset();

      // Automatically hide the success banner after 5 seconds
      setTimeout(() => {
        formSuccess.style.display = 'none';
      }, 5000);
    }
  });


  /* =================================================================---------
     5. BACK TO TOP BUTTON CONTROL
     ================================================================----------
     How this works:
     - We hide the button by default (opacity: 0).
     - We monitor scrolling: if the user scrolls past 300px, the button fades in.
     - On click, we trigger window.scrollTo with the 'smooth' behavior option.
  */
  const backToTopBtn = document.getElementById('backToTop');

  // 5.1 Show / Hide button on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible'); // Adds transition opacity in style.css
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  // 5.2 Click event scroll top handler
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Triggers native browser smooth scroll behavior
    });
  });


  /* =================================================================---------
     6. DYNAMIC FOOTER COPYRIGHT YEAR
     ================================================================----------
     How this works:
     - Instead of hardcoding the copyright year in index.html, we grab the current
       year from the system clock and inject it automatically.
     - This guarantees the copyright notices are always accurate without maintenance.
  */
  const footerYearSpan = document.getElementById('footerYear');
  if (footerYearSpan) {
    footerYearSpan.textContent = new Date().getFullYear();
  }

});
