
    var price = 0;
    var salesTax = 0.0825;
    var taxTotal = 0;
    var total = 0;

$(document).ready(function () {


    $(".price").on("change",function(){
        checkTotal();
    });
    // $(".salesTax").on("change",function(){
    //     changeTax();
    // });

});

function checkTotal(){
    price = $(".price").val();
    //console.log(price);
    taxTotal = price * salesTax;
    taxTotal = taxTotal.toFixed(2);
    //console.log(taxTotal);
    $(".taxTotal").val("$"+taxTotal);
    total = Number(price) + Number(taxTotal);
    total = total.toFixed(2);
    //console.log(total);
    $(".total").val("$"+total);

    $(".price").focus(function(){
        reset();
    });
    $(".price").on("click",function(){
        reset();
    });
}

// function changeTax(){
//     salesTax = $(".salesTax").val() * 0.001;
//     salesTax = salesTax.toFixed(5);
//     //console.log(salesTax);
// }

function reset(){
    price = 0;
    salesTax = 0.0825;
    taxTotal = 0;
    total = 0;
    $(".price").val("");
    $(".salesTax").val("");
    $(".taxTotal").val("");
    $(".total").val("");
    $(".price").focus();
}