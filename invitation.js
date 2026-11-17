const invitationLink = document.querySelector('.open-rsvp');
const responsePanel = document.getElementById('reponse');
const responseContent = responsePanel.querySelector('.response-inner');

invitationLink.addEventListener('click', () => {
  responsePanel.focus({ preventScroll: true });
  responseContent.classList.remove('answer-visible');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => responseContent.classList.add('answer-visible'));
  });
});
