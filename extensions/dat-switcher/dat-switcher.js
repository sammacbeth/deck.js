
const slideFile = 'currentSlide.txt';

$(document).bind('deck.init', async () => {
    if (!window.DatArchive) {
        console.log('not a dat browser');
        return;
    }
    const archive = new DatArchive(document.location.href);
    const { isOwner } = await archive.getInfo();

    if (isOwner) {
        // the owner writes slide changes to currentSlide.txt
        $(document).bind('deck.change', (event, from, to) => {
            console.log(`set current slide to ${to}`);
            archive.writeFile(slideFile, `${to}`);
            archive.commit();
        });
    } else {
        // consumers poll for changes to the current slide and update their
        // slide accordingly.
        let currentSlide = 0;

        async function syncSlide() {
            const newCurrentSlide = parseInt(await archive.readFile(slideFile));
            if (newCurrentSlide !== currentSlide) {
                currentSlide = newCurrentSlide;
                console.log(`switch to slide ${currentSlide}`)
                $.deck('go', currentSlide);
            }
        }
        
        await syncSlide();

        setInterval(syncSlide, 5000);        
    }
});
