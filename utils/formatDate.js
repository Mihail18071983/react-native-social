import format from "date-fns/format";
import uk from "date-fns/locale/uk";

const formatDate = (date) => {
  return format(Date.parse(date), "dd MMMM yyyy, HH:mm:ss", {
    locale: uk,
  });
};

export default formatDate;
