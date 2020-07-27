'use strict';

$('.myBut').click(function() {
    $(this).next().toggle();
})



$('#updateButton').click(function() {
    console.log('click')
    $(this).next().toggle();
})