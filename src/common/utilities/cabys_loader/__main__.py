import argparse
import pathlib
import excel_handler
import cabys_parser
from pprint import pprint

def main():
    parser = argparse.ArgumentParser(description="CABYS Loader")
    parser.add_argument("input_file", type=pathlib.Path, help="Path to the input file")
    parser.add_argument("--header", type=int, default=0, help="Row number to use as column names (default: 0)")
    parser.add_argument("--last-column", type=int, default=None, help="Last column to include in the data (optional)")
    args = parser.parse_args()

    input_file: pathlib.Path = args.input_file
    header: int = args.header
    last_column: int = int(args.last_column)

    if not input_file.exists():
        print(f"Error: The file {input_file} does not exist.")
        return
    
    dataframe = excel_handler.read_excel(input_file, header=header, last_column=last_column)
    column_names = cabys_parser.categorize_columns(dataframe)
    
    pprint(f"Categories Columns: {column_names.categories}")
    print()
    pprint(f"Descriptions Columns: {column_names.descriptions}")
    # print(f"DataFrame shape: {dataframe.shape}")
    # print(f"DataFrame head:\n{dataframe.head()}")


if __name__ == "__main__":
    main()