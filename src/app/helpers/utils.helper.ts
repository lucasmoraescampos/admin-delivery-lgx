export class UtilsHelper {

    public static numberToMoney(value: number) {
        return Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
    }

    public static moneyToNumber(value: string) {

        value = value.replace('.', '');

        value = value.replace(',', '.');

        return Number(value);

    }

    public static validateTime(time: string) {
        if (time.length != 8 && time.length != 5) {
            return false;
        }
        const value = time.split(':');
        if (
            Number(value[0]) < 0 || Number(value[0]) > 23 ||
            Number(value[1]) < 0 || Number(value[1]) > 59 ||
            (time.length == 8 && (Number(value[2]) < 0 || Number(value[2]) > 59))) {
            return false;
        }
        return true;
    }

    public static validateEmail(email: string) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        }
        return false;
    }

    public static validatePhone(phone: string) {
        phone = phone.replace(/[^0-9]/g, '');
        return phone.length == 11 && !isNaN(Number(phone));
    }

    public static validateDocumentNumber = (number: string) => {

        number = number.replace(/[^0-9]/g, '');

        if (number.length == 11) {

            let v1 = 0;
            let v2 = 0;
            let aux = false;

            for (let i = 1; number.length > i; i++) {
                if (number[i - 1] != number[i]) {
                    aux = true;
                }
            }

            if (aux == false) {
                return false;
            }

            for (let i = 0, p = 10; (number.length - 2) > i; i++, p--) {
                v1 += Number(number[i]) * p;
            }

            v1 = ((v1 * 10) % 11);

            if (v1 == 10) {
                v1 = 0;
            }

            if (v1 != Number(number[9])) {
                return false;
            }

            for (let i = 0, p = 11; (number.length - 1) > i; i++, p--) {
                v2 += Number(number[i]) * p;
            }

            v2 = ((v2 * 10) % 11);

            if (v2 == 10) {
                v2 = 0;
            }

            if (v2 != Number(number[10])) {
                return false;
            } else {
                return true;
            }

        } else if (number.length == 14) {

            let v1 = 0;
            let v2 = 0;
            let aux = false;

            for (let i = 1; number.length > i; i++) {
                if (number[i - 1] != number[i]) {
                    aux = true;
                }
            }

            if (aux == false) {
                return false;
            }

            for (let i = 0, p1 = 5, p2 = 13; (number.length - 2) > i; i++, p1--, p2--) {
                if (p1 >= 2) {
                    v1 += Number(number[i]) * p1;
                } else {
                    v1 += Number(number[i]) * p2;
                }
            }

            v1 = (v1 % 11);

            if (v1 < 2) {
                v1 = 0;
            } else {
                v1 = (11 - v1);
            }

            if (v1 != Number(number[12])) {
                return false;
            }

            for (let i = 0, p1 = 6, p2 = 14; (number.length - 1) > i; i++, p1--, p2--) {
                if (p1 >= 2) {
                    v2 += Number(number[i]) * p1;
                } else {
                    v2 += Number(number[i]) * p2;
                }
            }

            v2 = (v2 % 11);

            if (v2 < 2) {
                v2 = 0;
            } else {
                v2 = (11 - v2);
            }

            if (v2 != Number(number[13])) {
                return false;
            } else {
                return true;
            }

        } else {
            return false;
        }
    }
}