export const formatNumber = (number, thousands_separator = ' ', decimals = 0, decimal_separator = '.' ) => {
    let string = number.toString();

    let result_string = '';
    if(string.length > 3){
        for (var i = string.length;  i > 3; i -= 3) {
            result_string = thousands_separator + string.substring(i - 3, i) + result_string;
        }
        result_string = string.substring(i - 3, i) + result_string;
    } else {
        result_string = string;
    }
    return result_string;
}

export default formatNumber;