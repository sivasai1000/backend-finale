try {
    console.log('Loading pages...');
    require('./routes/pages');
    console.log('Pages loaded.');
    console.log('Loading terms...');
    require('./routes/terms');
    console.log('Terms loaded.');
} catch (e) {
    console.error(e);
}
