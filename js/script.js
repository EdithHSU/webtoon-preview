// tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

//-列表下拉選項
$(".component-serverlist button.btn").click(function (event) {
    const $btn = $(this);
    $btn.toggleClass('is-open');
    $btn.parent().next().toggleClass('is-open');

    const $icon = $btn.find('i.fas');
    if ($icon.hasClass('fa-plus')) {
        $icon.removeClass('fa-plus').addClass('fa-minus');
    } else {
        $icon.removeClass('fa-minus').addClass('fa-plus');
    }
});